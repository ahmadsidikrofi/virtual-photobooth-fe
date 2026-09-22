"use client";

import { useEffect, useRef, useState } from "react";

// Tangani log INFO/WARNING internal C++ TFLite/MediaPipe WebAssembly agar tidak dicetak sebagai error merah
if (typeof window !== "undefined" && !window.__tfliteLogCleaned) {
  window.__tfliteLogCleaned = true;
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Created TensorFlow Lite XNNPACK delegate for CPU") ||
        args[0].includes("inference_feedback_manager.cc") ||
        args[0].includes("landmark_projection_calculator.cc"))
    ) {
      // Alihkan log info C++ WebAssembly ini ke console.info alih-alih console.error
      console.info("[MediaPipe INFO]", ...args);
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

/**
 * Audio synthesis helper untuk bunyi chime/pop lembut (Web Audio API)
 * Dijalankan saat pose berhasil ditahan selama ~500ms (100% progress).
 */
function playSoftChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    // Nada lembut bersahabat (E5 659.25Hz -> A5 880Hz)
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);

    setTimeout(() => {
      ctx.close().catch(() => { });
    }, 400);
  } catch (err) {
    console.debug("[Audio] Soft chime notice:", err);
  }
}

/**
 * useHandGesture
 * Hook untuk deteksi gestur tangan hands-free menggunakan @mediapipe/tasks-vision.
 * 
 * Spesifikasi & Fitur:
 * 1. Pemuatan aman client-side via dynamic import di useEffect (mencegah kegagalan SSR build di Vercel).
 * 2. Menggunakan model resmi Google Storage CDN (gesture_recognizer float16) dan WASM CDN jsdelivr.
 * 3. Throttled inference loop berkala setiap 250ms (bukan 60fps) untuk menjaga performa CPU.
 * 4. Mendeteksi gestur standar: "Victory" (✌️) dan "ILoveYou" (🤟).
 * 5. Mendeteksi custom gestur berbasis landmark geometri:
 *    - Cat Paw / Cakar Kucing (🐾)
 *    - Half Heart / C-Shape (🫶)
 * 6. Mekanisme Tahan Pose (Hold-to-Trigger 500ms / 2 frame berturut-turut):
 *    - gestureHoldProgress: 0 -> 50 -> 100.
 *    - activeHoldGesture: { categoryName, emoji, label }.
 *    - Membunyikan soft chime saat mencapai 100%.
 * 7. Debounce 3 detik untuk mencegah pemicu hitung mundur ganda.
 * 8. Hanya memproses localVideoRef (tidak pernah menyentuh remoteVideoRef).
 */
export function useHandGesture({
  videoRef,
  isEnabled = false,
  sessionState = "idle",
  cameraActive = false,
  onGestureTrigger,
}) {
  const [isReady, setIsReady] = useState(false);
  const [gestureFeedback, setGestureFeedback] = useState(null);
  const [gestureHoldProgress, setGestureHoldProgress] = useState(0);
  const [activeHoldGesture, setActiveHoldGesture] = useState(null);

  const recognizerRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const lastTriggerRef = useRef(0);
  const holdProgressRef = useRef(0);
  const holdStartTimeRef = useRef(null);
  const currentPoseRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const onGestureTriggerRef = useRef(onGestureTrigger);

  useEffect(() => {
    onGestureTriggerRef.current = onGestureTrigger;
  }, [onGestureTrigger]);

  // 1. Inisialisasi GestureRecognizer HANYA jika isEnabled aktif di sisi client
  useEffect(() => {
    if (!isEnabled) return;

    let isMounted = true;

    async function initGestureRecognizer() {
      if (typeof window === "undefined") return;

      try {
        const { FilesetResolver, GestureRecognizer } = await import(
          "@mediapipe/tasks-vision"
        );

        // Muat WASM binaries dari CDN resmi
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        if (!isMounted) return;

        let recognizer = null;

        // Coba inisialisasi dengan akselerasi GPU terlebih dahulu
        try {
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
          });
        } catch (gpuErr) {
          console.warn("[MediaPipe] GPU delegate gagal, beralih ke CPU:", gpuErr);
          if (!isMounted) return;
          // Fallback ke CPU jika WebGL/GPU tidak didukung perangkat
          recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numHands: 1,
          });
        }

        if (isMounted && recognizer) {
          recognizerRef.current = recognizer;
          setIsReady(true);
        }
      } catch (err) {
        console.warn("[MediaPipe] Inisialisasi GestureRecognizer gagal:", err);
      }
    }

    initGestureRecognizer();

    return () => {
      isMounted = false;
      setIsReady(false);
      holdProgressRef.current = 0;
      holdStartTimeRef.current = null;
      currentPoseRef.current = null;
      setGestureHoldProgress(0);
      setActiveHoldGesture(null);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      if (recognizerRef.current) {
        try {
          recognizerRef.current.close();
        } catch { }
        recognizerRef.current = null;
      }
    };
  }, [isEnabled]);

  // 2. Throttled Inference Loop: Eksekusi berkala setiap 250ms (bukan 60fps)
  useEffect(() => {
    // Hanya jalankan loop jika gestur diaktifkan, recognizer siap, kamera aktif, dan status sesi "idle"
    if (!isEnabled || !isReady || !cameraActive || sessionState !== "idle") {
      if (holdProgressRef.current > 0 || holdStartTimeRef.current !== null) {
        holdProgressRef.current = 0;
        holdStartTimeRef.current = null;
        currentPoseRef.current = null;
        setGestureHoldProgress(0);
        setActiveHoldGesture(null);
      }
      return;
    }

    const intervalId = setInterval(() => {
      const recognizer = recognizerRef.current;
      const video = videoRef?.current;

      if (!recognizer || !video) return;

      // Pastikan elemen localVideoRef valid, siap diputar, dan memiliki dimensi video
      if (
        video.readyState < 2 ||
        video.paused ||
        video.ended ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        return;
      }

      try {
        const currentTime = Date.now();

        // Jika masih dalam masa debounce 3 detik setelah memicu, jangan proses pemicu baru
        if (currentTime - lastTriggerRef.current < 3000) {
          if (holdProgressRef.current > 0 || holdStartTimeRef.current !== null) {
            holdProgressRef.current = 0;
            holdStartTimeRef.current = null;
            currentPoseRef.current = null;
            setGestureHoldProgress(0);
            setActiveHoldGesture(null);
          }
          return;
        }

        const now = performance.now();
        // MediaPipe recognizeForVideo mewajibkan timestamp yang monoton naik
        if (now <= lastVideoTimeRef.current) return;
        lastVideoTimeRef.current = now;

        // Eksekusi pengenalan gestur video lokal
        const results = recognizer.recognizeForVideo(video, now);

        let detected = null;

        // A. Cek gestur standar yang dikenali model MediaPipe dengan confidence > 0.65
        if (results?.gestures && results.gestures.length > 0) {
          const topGesture = results.gestures[0]?.[0];
          if (topGesture && topGesture.score > 0.65) {
            if (topGesture.categoryName === "Victory") {
              detected = {
                categoryName: "Victory",
                label: "Victory / Peace",
                emoji: "✌️",
              };
            } else if (topGesture.categoryName === "ILoveYou") {
              detected = {
                categoryName: "ILoveYou",
                label: "I Love You Sign",
                emoji: "🤟",
              };
            }
          }
        }

        // B. Jika tidak terdeteksi Victory atau ILoveYou, lakukan pengecekan geometri custom (landmarks[0])
        if (!detected && results?.landmarks && results.landmarks.length > 0) {
          const lm = results.landmarks[0];
          if (lm && lm.length >= 21) {
            const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

            // 1. Deteksi Cat Paw (🐾):
            // - Telapak tangan menghadap kamera (pergelangan tangan lm[0] berada di bawah buku jari tengah lm[9]).
            // - Ujung jari (INDEX 8, MIDDLE 12, RING 16, PINKY 20) posisinya tertekuk ke arah dalam:
            //   Jarak Y ujung jari berada di antara sendi PIP (6, 10, 14, 18) dan sendi MCP (5, 9, 13, 17).
            // - Jari tidak mengepal habis menjadi tinju (tidak menempel di telapak tangan).
            const isHandUpright = lm[0].y > lm[9].y;
            const topCategory = results.gestures?.[0]?.[0]?.categoryName;
            const isFist = topCategory === "Closed_Fist";
            const isOpenHand = topCategory === "Open_Palm";

            if (isHandUpright && !isFist && !isOpenHand) {
              const fingerJoints = [
                { tip: 8, pip: 6, mcp: 5 },
                { tip: 12, pip: 10, mcp: 9 },
                { tip: 16, pip: 14, mcp: 13 },
                { tip: 20, pip: 18, mcp: 17 },
              ];

              let curledCount = 0;
              for (const f of fingerJoints) {
                const pipY = lm[f.pip].y;
                const mcpY = lm[f.mcp].y;
                const tipY = lm[f.tip].y;
                const minY = Math.min(pipY, mcpY) - 0.035;
                const maxY = Math.max(pipY, mcpY) + 0.045;
                const isBetween = tipY >= minY && tipY <= maxY;

                const dTipMcp = dist(lm[f.tip], lm[f.mcp]);
                // Tidak mengepal rapat sampai menempel di telapak tangan
                const notClenched = dTipMcp >= 0.045 && dTipMcp <= 0.22;

                if (isBetween && notClenched) {
                  curledCount++;
                }
              }

              // Jika minimal 3 dari 4 jari menekuk seperti cakar kucing
              if (curledCount >= 3) {
                detected = {
                  categoryName: "CatPaw",
                  label: "Cat Paw",
                  emoji: "🐾",
                };
              }
            }

            // 2. Deteksi Half Heart / C-Shape (🫶):
            // - Ujung jempol (THUMB_TIP 4) dan ujung telunjuk (INDEX_TIP 8) membentuk lengkungan busur
            //   dengan bukaan celah sedang (jarak Euclidean antara 0.10 - 0.24).
            // - Sendi perantara jempol dan telunjuk berada pada posisi melengkung keluar dari garis lurus.
            if (!detected) {
              const dThumbIndexTip = dist(lm[4], lm[8]);
              const hasHeartGap = dThumbIndexTip >= 0.10 && dThumbIndexTip <= 0.24;

              if (hasHeartGap) {
                // Lengkungan telunjuk: jarak langsung MCP 5 ke TIP 8 lebih pendek dari ruas melengkungnya
                const dIndexDirect = dist(lm[5], lm[8]);
                const dIndexSegments = dist(lm[5], lm[6]) + dist(lm[6], lm[8]);
                const isIndexCurved = dIndexDirect < dIndexSegments * 0.92;

                // Sendi perantara melengkung keluar membentuk busur C yang cukup lebar
                const dMidArc = dist(lm[6], lm[3]);
                const isArcBroad = dMidArc >= 0.09;

                // Jari tengah, manis, kelingking terlipat atau tidak mencuat keluar dari busur
                const dMiddleWrist = dist(lm[12], lm[0]);
                const dIndexWrist = dist(lm[8], lm[0]);
                const isOtherFingersFolded =
                  lm[12].y > lm[10].y || dMiddleWrist < dIndexWrist * 0.95;

                if (isIndexCurved && isArcBroad && isOtherFingersFolded) {
                  detected = {
                    categoryName: "HalfHeart",
                    label: "Half Heart",
                    emoji: "🫶",
                  };
                }
              }
            }
          }
        }

        // C. Mekanisme Tahan Pose (Hold-to-Trigger 2000ms / 2 Detik):
        const HOLD_DURATION_MS = 500;

        if (detected) {
          // Jika pose saat ini sama dengan pose yang sedang ditahan
          if (
            currentPoseRef.current?.categoryName === detected.categoryName &&
            holdStartTimeRef.current !== null
          ) {
            const elapsed = currentTime - holdStartTimeRef.current;
            const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
            holdProgressRef.current = progress;

            if (elapsed >= HOLD_DURATION_MS) {
              // Capai 100%! (~2000ms atau 2 detik pose berhasil ditahan terus menerus)
              const completedPose = detected;

              // Reset progress & tracking
              holdProgressRef.current = 0;
              holdStartTimeRef.current = null;
              currentPoseRef.current = null;
              setGestureHoldProgress(0);
              setActiveHoldGesture(null);

              // Jeda debounce 3 detik
              lastTriggerRef.current = currentTime;

              // Putar nada umpan balik pendek yang lembut (soft chime/pop)
              playSoftChime();

              const showFeedback = (msg) => {
                setGestureFeedback(msg);
                if (feedbackTimeoutRef.current) {
                  clearTimeout(feedbackTimeoutRef.current);
                }
                feedbackTimeoutRef.current = setTimeout(() => {
                  setGestureFeedback(null);
                }, 3000);
              };

              // Umpan balik awal
              showFeedback(`Pose ${completedPose.emoji} Terdeteksi!`);

              // Eksekusi callback pemicu
              if (onGestureTriggerRef.current) {
                onGestureTriggerRef.current({
                  categoryName: completedPose.categoryName,
                  emoji: completedPose.emoji,
                  label: completedPose.label,
                  setFeedback: showFeedback,
                });
              }
            } else {
              setGestureHoldProgress(progress);
              setActiveHoldGesture(detected);
            }
          } else {
            // Pose baru terdeteksi: mulai hitung waktu dan beri progress awal (~12%)
            holdStartTimeRef.current = currentTime;
            currentPoseRef.current = detected;
            const initialProgress = Math.round((250 / HOLD_DURATION_MS) * 100);
            holdProgressRef.current = initialProgress;
            setGestureHoldProgress(initialProgress);
            setActiveHoldGesture(detected);
          }
        } else {
          // Tangan dilepas atau pose tidak valid sebelum 2000ms: reset progress
          if (holdProgressRef.current > 0 || holdStartTimeRef.current !== null) {
            holdProgressRef.current = 0;
            holdStartTimeRef.current = null;
            currentPoseRef.current = null;
            setGestureHoldProgress(0);
            setActiveHoldGesture(null);
          }
        }
      } catch (err) {
        // Tangani kesalahan frame tanpa mematikan aplikasi
        console.debug("[MediaPipe] Error saat recognize frame video:", err);
      }
    }, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, [isEnabled, isReady, cameraActive, sessionState, videoRef]);

  return {
    isReady,
    gestureFeedback,
    setGestureFeedback,
    gestureHoldProgress,
    activeHoldGesture,
  };
}
