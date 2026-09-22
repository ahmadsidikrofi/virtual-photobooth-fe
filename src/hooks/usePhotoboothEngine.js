"use client";

import { useRef, useCallback, useEffect } from "react";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";
import { useRoomStore } from "@/stores/useRoomStore";

// Helper: Draw video frame with object-fit: cover into destination rect (dx, dy, dWidth, dHeight)
function drawVideoCover(ctx, video, dx, dy, dWidth, dHeight, isMirrored = false) {
  if (!video) return;
  const vWidth = video.videoWidth || 1280;
  const vHeight = video.videoHeight || 720;
  const targetRatio = dWidth / dHeight;
  const videoRatio = vWidth / vHeight;

  let sWidth, sHeight, sx, sy;

  if (videoRatio > targetRatio) {
    // Video is wider than target slot: crop left & right
    sHeight = vHeight;
    sWidth = vHeight * targetRatio;
    sx = (vWidth - sWidth) / 2;
    sy = 0;
  } else {
    // Video is taller than target slot: crop top & bottom
    sWidth = vWidth;
    sHeight = vWidth / targetRatio;
    sx = 0;
    sy = (vHeight - sHeight) / 2;
  }

  ctx.save();
  if (isMirrored) {
    ctx.translate(dx + dWidth, dy);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, dWidth, dHeight);
  } else {
    ctx.drawImage(video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
  ctx.restore();
}

export function usePhotoboothEngine({
  videoRef,
  localVideoRef: propLocalVideoRef,
  remoteVideoRef: propRemoteVideoRef,
  remoteStream: propRemoteStream,
  role: propRole,
  isHost: propIsHost,
  totalShots = 8,
} = {}) {
  // Connect to global photobooth store
  const selectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const timerDuration = usePhotoboothStore((s) => s.timerDuration);
  const isMirrored = usePhotoboothStore((s) => s.isMirrored);
  const sessionState = usePhotoboothStore((s) => s.sessionState);
  const countdownValue = usePhotoboothStore((s) => s.countdownValue);
  const currentShot = usePhotoboothStore((s) => s.currentShot);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);
  const selectedIndices = usePhotoboothStore((s) => s.selectedIndices);
  const transitionText = usePhotoboothStore((s) => s.transitionText);

  const setSelectedLayout = usePhotoboothStore((s) => s.setSelectedLayout);
  const setTimerDuration = usePhotoboothStore((s) => s.setTimerDuration);
  const setIsMirrored = usePhotoboothStore((s) => s.setIsMirrored);
  const toggleMirror = usePhotoboothStore((s) => s.toggleMirror);
  const setSessionState = usePhotoboothStore((s) => s.setSessionState);
  const setCountdownValue = usePhotoboothStore((s) => s.setCountdownValue);
  const setCurrentShot = usePhotoboothStore((s) => s.setCurrentShot);
  const setTransitionText = usePhotoboothStore((s) => s.setTransitionText);
  const setCapturedPhotos = usePhotoboothStore((s) => s.setCapturedPhotos);
  const setSelectedIndices = usePhotoboothStore((s) => s.setSelectedIndices);
  const addCapturedPhoto = usePhotoboothStore((s) => s.addCapturedPhoto);
  const toggleSelectPhoto = usePhotoboothStore((s) => s.toggleSelectPhoto);
  const storeResetSession = usePhotoboothStore((s) => s.resetSession);

  // Connect to global room store
  const storeRemoteStream = useRoomStore((s) => s.remoteStream);
  const storeRole = useRoomStore((s) => s.role);

  const localVideoRef = propLocalVideoRef || videoRef;
  const remoteVideoRef = propRemoteVideoRef;
  const remoteStream = propRemoteStream !== undefined ? propRemoteStream : storeRemoteStream;
  const role = propRole !== undefined ? propRole : storeRole;
  const isHost = propIsHost !== undefined ? propIsHost : role === "host";

  const hiddenCanvasRef = useRef(null);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMirroredRef = useRef(isMirrored);
  const timerDurationRef = useRef(timerDuration);
  const remoteStreamRef = useRef(remoteStream);
  const roleRef = useRef(role);
  const isHostRef = useRef(isHost);

  useEffect(() => {
    isMirroredRef.current = isMirrored;
  }, [isMirrored]);

  useEffect(() => {
    timerDurationRef.current = timerDuration;
  }, [timerDuration]);

  useEffect(() => {
    remoteStreamRef.current = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  // Subtle Web Audio shutter and countdown sound cues
  const playSound = useCallback((type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "tick") {
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "shutter") {
        osc.type = "square";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Cleanup timers on unmount
  const clearAllTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const hasPeerDisconnected = useRoomStore((s) => s.hasPeerDisconnected);

  // Hentikan sesi foto dan reset dari awal jika partner terdiskoneksi saat sesi foto berlangsung di bilik berdua
  useEffect(() => {
    const hasActiveSession =
      sessionState === "countdown" ||
      sessionState === "flash" ||
      sessionState === "transition" ||
      sessionState === "curating" ||
      sessionState === "designing";

    if (hasPeerDisconnected && hasActiveSession) {
      clearAllTimers();
      storeResetSession();
    }
  }, [hasPeerDisconnected, sessionState, clearAllTimers, storeResetSession]);

  // Capture current video frame(s) to temporary high-res canvas (Solo or Duo Side-by-Side)
  const captureFrame = useCallback(() => {
    const localVideo = localVideoRef?.current;
    if (!localVideo) return null;

    let canvas = hiddenCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      hiddenCanvasRef.current = canvas;
    }

    // High resolution temporary canvas (1200 x 800 for 3:2 ratio)
    const CANVAS_WIDTH = 1200;
    const CANVAS_HEIGHT = 800;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Bersihkan canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const remoteVideo = remoteVideoRef?.current;
    const activeRemoteStream = remoteStreamRef.current;
    const isRemoteVideoActive =
      Boolean(activeRemoteStream) &&
      Boolean(remoteVideo) &&
      (remoteVideo.videoWidth > 0 || remoteVideo.readyState >= 2);

    const shouldMirrorLocal = Boolean(isMirroredRef.current);
    const isCurrentUserHost = isHostRef.current || roleRef.current === "host";

    if (activeRemoteStream && isRemoteVideoActive) {
      // =========================================================================
      // Kondisi B: Mode Berdua (remoteStream !== null dan remoteVideoRef.current aktif)
      // Bagi lebar kanvas menjadi 2 bagian sama rata (split-screen side-by-side)
      // =========================================================================
      const halfWidth = CANVAS_WIDTH / 2;

      if (isCurrentUserHost) {
        // HOST:
        // - localVideoRef (Host) di sisi kiri: (0, 0, halfWidth, canvas.height)
        // - remoteVideoRef (Guest) di sisi kanan: (halfWidth, 0, halfWidth, canvas.height)
        drawVideoCover(ctx, localVideo, 0, 0, halfWidth, CANVAS_HEIGHT, shouldMirrorLocal);
        drawVideoCover(ctx, remoteVideo, halfWidth, 0, halfWidth, CANVAS_HEIGHT, false);
      } else {
        // GUEST:
        // - remoteVideoRef (Host) di sisi kiri: (0, 0, halfWidth, canvas.height)
        // - localVideoRef (Guest) di sisi kanan: (halfWidth, 0, halfWidth, canvas.height)
        drawVideoCover(ctx, remoteVideo, 0, 0, halfWidth, CANVAS_HEIGHT, false);
        drawVideoCover(ctx, localVideo, halfWidth, 0, halfWidth, CANVAS_HEIGHT, shouldMirrorLocal);
      }

      // Garis pemisah tipis estetis di tengah (garis putih 2px)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(halfWidth - 1, 0, 2, CANVAS_HEIGHT);
    } else {
      // =========================================================================
      // Kondisi A: Mode Solo (remoteStream === null)
      // localVideoRef memenuhi seluruh area kanvas (0, 0, canvas.width, canvas.height)
      // =========================================================================
      drawVideoCover(ctx, localVideo, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, shouldMirrorLocal);
    }

    // Ekspor kanvas ke Data URL: canvas.toDataURL("image/jpeg", 0.92)
    return canvas.toDataURL("image/jpeg", 0.92);
  }, [localVideoRef, remoteVideoRef]);

  // Execute a single shot cycle: countdown -> flash -> canvas capture -> transition/finish (8 Shots otomatis)
  const executeShot = useCallback(
    function runShot(shotNumber) {
      clearAllTimers();
      setTransitionText(null);
      setSessionState("countdown");
      setCurrentShot(shotNumber);

      const initialDuration = timerDurationRef.current;
      setCountdownValue(initialDuration);
      playSound("tick");

      let count = initialDuration;

      timerRef.current = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownValue(count);
          playSound("tick");
        } else {
          // Count reached 0: Shutter trigger
          clearInterval(timerRef.current);
          timerRef.current = null;

          // 1. Trigger flash effect
          setSessionState("flash");
          playSound("shutter");

          // 2. Capture frame from composite canvas
          const photoDataUrl = captureFrame();
          if (photoDataUrl) {
            addCapturedPhoto(photoDataUrl);
          }

          // 3. Dismiss flash after 150ms
          timeoutRef.current = setTimeout(() => {
            if (shotNumber < totalShots) {
              const nextShot = shotNumber + 1;
              setCurrentShot(nextShot);
              setSessionState("transition");
              setTransitionText(`Pose ke-${nextShot} bersiap!`);

              // 2-second transition pause before next countdown
              timeoutRef.current = setTimeout(() => {
                runShot(nextShot);
              }, 2000);
            } else {
              // All photos captured -> move to curating screen otomatis
              setSessionState("curating");
              setTransitionText(null);
            }
          }, 150);
        }
      }, 1000);
    },
    [
      captureFrame,
      clearAllTimers,
      playSound,
      setTransitionText,
      setSessionState,
      setCurrentShot,
      setCountdownValue,
      addCapturedPhoto,
      totalShots,
    ]
  );

  // Start the 8-shots solo photobooth session
  const startSession = useCallback(() => {
    clearAllTimers();
    setCapturedPhotos([]);
    setSelectedIndices([]);
    setCurrentShot(1);
    executeShot(1);
  }, [
    clearAllTimers,
    executeShot,
    setCapturedPhotos,
    setSelectedIndices,
    setCurrentShot,
  ]);

  // Reset to initial idle state
  const resetSession = useCallback(() => {
    clearAllTimers();
    storeResetSession();
  }, [clearAllTimers, storeResetSession]);

  return {
    selectedLayout,
    setSelectedLayout,
    timerDuration,
    setTimerDuration,
    isMirrored,
    setIsMirrored,
    toggleMirror,
    sessionState,
    setSessionState,
    countdownValue,
    currentShot,
    capturedPhotos,
    selectedIndices,
    setSelectedIndices,
    transitionText,
    startSession,
    resetSession,
    toggleSelectPhoto,
    captureFrame,
    totalShots,
  };
}
