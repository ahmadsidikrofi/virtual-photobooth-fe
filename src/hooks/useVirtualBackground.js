"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useVirtualBackgroundStore } from "@/stores/useVirtualBackgroundStore";
import { VIRTUAL_BACKGROUND_PRESETS } from "@/config/virtualBackgroundPresets";
import { toast } from "@/components/ui/toast";

// Helper: Menggambar gambar atau video dengan rasio cover (object-fit: cover) ke kanvas tujuan
function drawCover(ctx, source, destWidth, destHeight) {
  if (!source) return;
  const sWidth = source.videoWidth || source.naturalWidth || source.width;
  const sHeight = source.videoHeight || source.naturalHeight || source.height;
  if (!sWidth || !sHeight) return;

  const targetRatio = destWidth / destHeight;
  const sourceRatio = sWidth / sHeight;

  let renderWidth, renderHeight, sx, sy;

  if (sourceRatio > targetRatio) {
    renderHeight = sHeight;
    renderWidth = sHeight * targetRatio;
    sx = (sWidth - renderWidth) / 2;
    sy = 0;
  } else {
    renderWidth = sWidth;
    renderHeight = sWidth / targetRatio;
    sx = 0;
    sy = (sHeight - renderHeight) / 2;
  }

  ctx.drawImage(
    source,
    sx,
    sy,
    renderWidth,
    renderHeight,
    0,
    0,
    destWidth,
    destHeight
  );
}

// Hermite cubic smoothstep S-Curve:
// Mengeliminasi noise latar di bawah 0.10 dan memastikan tubuh solid di atas 0.85
// Menghasilkan gradien alpha tepi yang memudar secara optis alami seperti Google Meet
function getSmoothAlpha(conf) {
  if (conf <= 0.10) return 0;
  if (conf >= 0.85) return 255;
  const t = (conf - 0.10) / 0.75;
  return Math.round(t * t * (3 - 2 * t) * 255);
}

/**
 * useVirtualBackground
 * Hook client-side untuk memproses virtual background (blur & studio backdrop)
 * menggunakan MediaPipe ImageSegmenter dengan akselerasi GPU (WebAssembly).
 * 
 * Spesifikasi & Prinsip:
 * 1. Lazy Loading: ImageSegmenter HANYA dimuat saat mode !== 'none'.
 * 2. Kualitas Tajam: Output kanvas dikunci di 1280x720 (720p 16:9).
 * 3. Inferensi Ringan: Downscale masukan segmentasi ke ukuran kecil (256x144) agar ringan di GPU/CPU.
 * 4. Zero Overhead saat Nonaktif: Jika mode 'none', langsung teruskan stream kamera asli (100% resolusi murni).
 * 5. Track Audio Tetap Utuh: Menjaga mikrofon tetap tersambung ke activeStream.
 */
export function useVirtualBackground({ rawStream, cameraActive = true }) {
  const backgroundMode = useVirtualBackgroundStore((s) => s.backgroundMode);
  const selectedPresetId = useVirtualBackgroundStore((s) => s.selectedPresetId);
  const customImage = useVirtualBackgroundStore((s) => s.customImage);
  const blurIntensity = useVirtualBackgroundStore((s) => s.blurIntensity);
  const setIsModelLoading = useVirtualBackgroundStore((s) => s.setIsModelLoading);
  const setModelError = useVirtualBackgroundStore((s) => s.setModelError);

  // Stream aktif yang dikembalikan ke pemanggil (rawStream atau processedStream)
  const [activeStream, setActiveStream] = useState(rawStream);

  // Referensi internal untuk elemen processing
  const segmenterRef = useRef(null);
  const isSegmenterLoadingRef = useRef(false);
  const hiddenVideoRef = useRef(null);
  const processingCanvasRef = useRef(null);
  const inputCanvasRef = useRef(null);
  const rawMaskCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const processedStreamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastTimestampRef = useRef(-1);
  const lastInferenceTimeRef = useRef(0);
  const isInferencingRef = useRef(false);
  const prevConfidenceRef = useRef(null);
  const hasValidMaskRef = useRef(false);
  const imageCacheRef = useRef(new Map());
  const failedUrlsRef = useRef(new Set());

  // Pastikan elemen hidden video tersedia di DOM internal
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!hiddenVideoRef.current) {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.style.display = "none";
      hiddenVideoRef.current = video;
      document.body.appendChild(video);
    }

    if (!processingCanvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      processingCanvasRef.current = canvas;
    }

    if (!inputCanvasRef.current) {
      const canvas = document.createElement("canvas");
      // Resolusi inferensi 320x180: tajam untuk tepi tubuh & ringan untuk GPU (~3ms)
      canvas.width = 320;
      canvas.height = 180;
      inputCanvasRef.current = canvas;
    }

    if (!rawMaskCanvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      rawMaskCanvasRef.current = canvas;
    }

    if (!maskCanvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 720;
      maskCanvasRef.current = canvas;
    }

    return () => {
      if (hiddenVideoRef.current && hiddenVideoRef.current.parentNode) {
        hiddenVideoRef.current.pause();
        hiddenVideoRef.current.srcObject = null;
        hiddenVideoRef.current.parentNode.removeChild(hiddenVideoRef.current);
        hiddenVideoRef.current = null;
      }
    };
  }, []);

  // Hubungkan rawStream ke hiddenVideoRef
  useEffect(() => {
    const video = hiddenVideoRef.current;
    if (!video) return;

    if (rawStream && cameraActive) {
      if (video.srcObject !== rawStream) {
        video.srcObject = rawStream;
      }
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [rawStream, cameraActive]);

  // Lazy load MediaPipe ImageSegmenter (Hanya saat fitur diaktifkan)
  const initSegmenter = useCallback(async () => {
    if (segmenterRef.current || isSegmenterLoadingRef.current) return;
    if (typeof window === "undefined") return;

    isSegmenterLoadingRef.current = true;
    setIsModelLoading(true);
    setModelError(null);

    try {
      const { FilesetResolver, ImageSegmenter } = await import(
        "@mediapipe/tasks-vision"
      );

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Model lokal di folder public/models/selfie_segmenter.tflite (0 latency, 100% reliable)
      const localModelUrl = `${window.location.origin}/models/selfie_segmenter.tflite`;
      const cdnModelUrl =
        "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

      let segmenter = null;

      // 1. Coba model lokal dengan akselerasi GPU
      try {
        segmenter = await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: localModelUrl,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch (localGpuErr) {
        console.warn("[VirtualBackground] GPU lokal gagal, mencoba CPU lokal:", localGpuErr);
        try {
          segmenter = await ImageSegmenter.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: localModelUrl,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            outputCategoryMask: false,
            outputConfidenceMasks: true,
          });
        } catch (localCpuErr) {
          console.warn("[VirtualBackground] Model lokal gagal, fallback ke Google CDN:", localCpuErr);
          // 2. Fallback ke Google CDN resmi (.tflite)
          try {
            segmenter = await ImageSegmenter.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: cdnModelUrl,
                delegate: "GPU",
              },
              runningMode: "VIDEO",
              outputCategoryMask: false,
              outputConfidenceMasks: true,
            });
          } catch (cdnGpuErr) {
            console.warn("[VirtualBackground] CDN GPU gagal, fallback CDN CPU:", cdnGpuErr);
            segmenter = await ImageSegmenter.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: cdnModelUrl,
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              outputCategoryMask: false,
              outputConfidenceMasks: true,
            });
          }
        }
      }

      if (segmenter) {
        segmenterRef.current = segmenter;
        console.log("[VirtualBackground] MediaPipe ImageSegmenter berhasil dimuat dan siap digunakan.");
      } else {
        throw new Error("Segmenter tidak dapat diinisialisasi.");
      }
    } catch (err) {
      console.error("[VirtualBackground] Gagal mengunduh ImageSegmenter:", err);
      setModelError("Gagal memuat modul AI latar belakang. Silakan coba lagi.");
    } finally {
      isSegmenterLoadingRef.current = false;
      setIsModelLoading(false);
    }
  }, [setIsModelLoading, setModelError]);

  // Dapatkan gambar latar belakang (Preset atau Custom Upload)
  const getActiveBackgroundImage = useCallback(() => {
    if (backgroundMode === "custom" && customImage) {
      if (imageCacheRef.current.has(customImage)) {
        return imageCacheRef.current.get(customImage);
      }
      const img = new Image();
      img.src = customImage;
      img.onerror = () => {
        img.__hasError = true;
        if (!failedUrlsRef.current.has(customImage)) {
          failedUrlsRef.current.add(customImage);
          toast.add({
            title: "Gagal Memuat Gambar Kustom",
            description: "Gambar yang diunggah tidak dapat dimuat atau berkas rusak.",
            type: "error",
          });
        }
      };
      imageCacheRef.current.set(customImage, img);
      return img;
    }

    if (backgroundMode === "preset" && selectedPresetId) {
      const preset = VIRTUAL_BACKGROUND_PRESETS.find(
        (p) => p.id === selectedPresetId
      );
      if (preset?.imageUrl) {
        if (imageCacheRef.current.has(preset.imageUrl)) {
          return imageCacheRef.current.get(preset.imageUrl);
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = preset.imageUrl;
        img.onerror = () => {
          img.__hasError = true;
          console.warn("[VirtualBackground] Gagal memuat preset gambar:", preset.imageUrl);

          // Coba fallback URL jika tersedia
          if (preset.fallbackUrl && img.src !== preset.fallbackUrl) {
            console.log("[VirtualBackground] Mencoba fallback URL:", preset.fallbackUrl);
            img.__hasError = false;
            img.src = preset.fallbackUrl;
            return;
          }

          if (!failedUrlsRef.current.has(preset.imageUrl)) {
            failedUrlsRef.current.add(preset.imageUrl);
            toast.add({
              title: "Latar Studio (404 Not Found)",
              description: `Gambar ${preset.name} tidak dapat diakses. Menggunakan warna cadangan studio.`,
              type: "error",
            });
          }
        };
        imageCacheRef.current.set(preset.imageUrl, img);
        return img;
      }
    }

    return null;
  }, [backgroundMode, selectedPresetId, customImage]);

  // Main Render Loop: Segmentasi & Canvas Compositing
  useEffect(() => {
    // KONDISI 1: Jika Virtual Background dinonaktifkan ('none') atau kamera mati
    if (backgroundMode === "none" || !cameraActive || !rawStream) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      prevConfidenceRef.current = null;
      lastInferenceTimeRef.current = 0;
      hasValidMaskRef.current = false;

      // Hentikan track video kanvas dan bebaskan memori captureStream
      if (processedStreamRef.current) {
        processedStreamRef.current.getTracks().forEach((track) => {
          if (track.kind === "video") {
            try {
              track.stop();
            } catch {}
          }
        });
        processedStreamRef.current = null;
      }
      // Kembalikan stream ke kamera murni (100% resolusi penuh tanpa beban AI)
      setActiveStream(rawStream);
      return;
    }

    // KONDISI 2: Virtual Background Aktif ('blur', 'preset', 'custom')
    let isCancelled = false;

    // Pastikan model segmenter diunduh secara malas
    if (!segmenterRef.current) {
      initSegmenter();
    }

    const render = () => {
      if (isCancelled) return;
      const now = performance.now();

      const video = hiddenVideoRef.current;
      const processingCanvas = processingCanvasRef.current;
      const inputCanvas = inputCanvasRef.current;
      const rawMaskCanvas = rawMaskCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      const segmenter = segmenterRef.current;

      if (!video || !processingCanvas || !inputCanvas || !rawMaskCanvas || !maskCanvas) {
        animFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      // Pastikan hidden video memutar frame
      if (video.paused && video.readyState >= 2) {
        video.play().catch(() => {});
      }

      // Pastikan frame video siap dan memiliki dimensi
      if (
        video.readyState >= 2 &&
        !video.ended &&
        video.videoWidth > 0 &&
        video.videoHeight > 0
      ) {
        const pCtx = processingCanvas.getContext("2d");
        const inCtx = inputCanvas.getContext("2d", { willReadFrequently: true });
        const rawMaskCtx = rawMaskCanvas.getContext("2d");
        const maskCtx = maskCanvas.getContext("2d");

        if (pCtx) {
          // 1. Eksekusi inferensi AI MediaPipe secara terukur (~30 FPS / setiap 33ms)
          // Memisahkan inferensi AI (30 FPS) dari render kanvas (60 FPS) mencegah GPU/CPU lag
          if (
            segmenter &&
            inCtx &&
            rawMaskCtx &&
            maskCtx &&
            !isInferencingRef.current &&
            now - lastInferenceTimeRef.current >= 33 &&
            now > lastTimestampRef.current
          ) {
            isInferencingRef.current = true;
            lastInferenceTimeRef.current = now;
            lastTimestampRef.current = now;

            try {
              // Perkecil frame ke inputCanvas (320x180) untuk inferensi AI tajam & ringan
              inCtx.drawImage(video, 0, 0, 320, 180);

              // Eksekusi segmentasi video MediaPipe (Continuous Confidence Matting)
              const result = segmenter.segmentForVideo(inputCanvas, now);

              if (result && result.confidenceMasks && result.confidenceMasks.length > 0) {
                const personMask = result.confidenceMasks[0];
                const confArray = personMask.getAsFloat32Array();
                const mWidth = personMask.width;
                const mHeight = personMask.height;

                // Konversi continuous float confidence ke rawMaskCanvas (320x180) dengan temporal EMA
                const rawMaskImageData = rawMaskCtx.createImageData(mWidth, mHeight);
                const pixels = rawMaskImageData.data;

                let prevConf = prevConfidenceRef.current;
                if (!prevConf || prevConf.length !== confArray.length) {
                  prevConf = new Float32Array(confArray.length);
                  prevConfidenceRef.current = prevConf;
                  prevConf.set(confArray);
                }

                for (let i = 0; i < confArray.length; i++) {
                  const rawConf = confArray[i];
                  // Temporal EMA smoothing: 75% frame baru + 25% frame lama (meredam flickering tepi)
                  const smoothedConf = prevConf[i] * 0.25 + rawConf * 0.75;
                  prevConf[i] = smoothedConf;

                  const alpha = getSmoothAlpha(smoothedConf);
                  const idx = i * 4;
                  pixels[idx] = 255;
                  pixels[idx + 1] = 255;
                  pixels[idx + 2] = 255;
                  pixels[idx + 3] = alpha;
                }
                rawMaskCtx.putImageData(rawMaskImageData, 0, 0);

                // Render masker ke resolusi 720p dengan filter blur optis lembut (Google Meet style)
                maskCtx.clearRect(0, 0, 1280, 720);
                maskCtx.imageSmoothingEnabled = true;
                maskCtx.imageSmoothingQuality = "high";
                maskCtx.filter = "blur(3.5px)";
                maskCtx.drawImage(rawMaskCanvas, 0, 0, 1280, 720);
                maskCtx.filter = "none";

                hasValidMaskRef.current = true;
              }

              if (result && typeof result.close === "function") {
                result.close();
              }
            } catch (inferErr) {
              console.debug("[VirtualBackground] Skip frame:", inferErr);
            } finally {
              isInferencingRef.current = false;
            }
          }

          // 2. Render komposit ke processingCanvas (1280x720) pada 60 FPS penuh tanpa patah-patah
          if (hasValidMaskRef.current && maskCtx) {
            // a. Gambarkan frame video webcam asli
            pCtx.clearRect(0, 0, 1280, 720);
            drawCover(pCtx, video, 1280, 720);

            // b. Potong area ruangan menggunakan masker halus (Alpha Matting)
            pCtx.globalCompositeOperation = "destination-in";
            pCtx.drawImage(maskCanvas, 0, 0, 1280, 720);

            // c. Tempelkan latar studio / blur DI BAWAH tubuh pengguna
            pCtx.globalCompositeOperation = "destination-over";

            if (backgroundMode === "blur") {
              pCtx.save();
              const blurPx =
                blurIntensity === "strong"
                  ? "24px"
                  : blurIntensity === "subtle"
                  ? "8px"
                  : "14px";
              pCtx.filter = `blur(${blurPx})`;
              pCtx.drawImage(video, -20, -20, 1320, 760);
              pCtx.restore();
            } else {
              const bgImage = getActiveBackgroundImage();
              if (bgImage && bgImage.complete && !bgImage.__hasError && bgImage.naturalWidth > 0) {
                drawCover(pCtx, bgImage, 1280, 720);
              } else {
                const preset = VIRTUAL_BACKGROUND_PRESETS.find(
                  (p) => p.id === selectedPresetId
                );
                pCtx.fillStyle = preset?.previewColor || "#2A2723";
                pCtx.fillRect(0, 0, 1280, 720);
              }
            }

            // d. Kembalikan mode operasi standar
            pCtx.globalCompositeOperation = "source-over";
          } else {
            // Selama segmenter AI belum menghasilkan masker pertama, tampilkan video asli
            pCtx.clearRect(0, 0, 1280, 720);
            drawCover(pCtx, video, 1280, 720);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    // Jalankan loop render
    animFrameIdRef.current = requestAnimationFrame(render);

    // Ambil stream dari processingCanvas (30fps)
    if (processingCanvasRef.current) {
      if (!processedStreamRef.current) {
        try {
          const canvasStream = processingCanvasRef.current.captureStream(30);
          processedStreamRef.current = canvasStream;
        } catch (streamErr) {
          console.warn("[VirtualBackground] captureStream error:", streamErr);
        }
      }

      if (processedStreamRef.current) {
        // Pindahkan audio track asli dari rawStream agar mikrofon tetap bersuara
        const audioTracks = rawStream.getAudioTracks();
        const existingAudio = processedStreamRef.current.getAudioTracks();
        existingAudio.forEach((t) => processedStreamRef.current.removeTrack(t));
        audioTracks.forEach((t) => processedStreamRef.current.addTrack(t));

        setActiveStream(processedStreamRef.current);
      }
    }

    return () => {
      isCancelled = true;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [
    backgroundMode,
    cameraActive,
    rawStream,
    blurIntensity,
    selectedPresetId,
    customImage,
    initSegmenter,
    getActiveBackgroundImage,
  ]);

  // Bersihkan model saat unmount permanen
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (segmenterRef.current) {
        try {
          segmenterRef.current.close();
        } catch {}
        segmenterRef.current = null;
      }
    };
  }, []);

  return {
    activeStream,
    processingCanvasRef,
    isVirtualBackgroundActive: backgroundMode !== "none",
  };
}
