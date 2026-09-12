"use client";

import { useRef, useCallback, useEffect } from "react";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";

export function usePhotoboothEngine({ videoRef }) {
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

  const hiddenCanvasRef = useRef(null);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);
  const isMirroredRef = useRef(isMirrored);
  const timerDurationRef = useRef(timerDuration);

  useEffect(() => {
    isMirroredRef.current = isMirrored;
  }, [isMirrored]);

  useEffect(() => {
    timerDurationRef.current = timerDuration;
  }, [timerDuration]);

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

  // Capture current video frame to hidden HTML5 canvas with exact mirror sync
  const captureFrame = useCallback(() => {
    const video = videoRef?.current;
    if (!video) return null;

    let canvas = hiddenCanvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      hiddenCanvasRef.current = canvas;
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Canvas Mirroring Synchronization:
    if (Boolean(isMirroredRef.current)) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL("image/jpeg", 0.95);
  }, [videoRef]);

  // Execute a single shot cycle: countdown -> flash -> canvas capture -> transition/finish (8 Shots universal buffer)
  const executeShot = useCallback((shotNumber) => {
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

        // 2. Capture frame from video element
        const photoDataUrl = captureFrame();
        if (photoDataUrl) {
          addCapturedPhoto(photoDataUrl);
        }

        // 3. Dismiss flash after 150ms
        timeoutRef.current = setTimeout(() => {
          if (shotNumber < 8) {
            const nextShot = shotNumber + 1;
            setCurrentShot(nextShot);
            setSessionState("idle");
            setTransitionText(`Pose ke-${nextShot} bersiap!`);

            // 2-second transition pause before next countdown
            timeoutRef.current = setTimeout(() => {
              executeShot(nextShot);
            }, 2000);
          } else {
            // All 8 photos captured -> move to curating screen
            setSessionState("curating");
            setTransitionText(null);
          }
        }, 150);
      }
    }, 1000);
  }, [
    captureFrame,
    clearAllTimers,
    playSound,
    setTransitionText,
    setSessionState,
    setCurrentShot,
    setCountdownValue,
    addCapturedPhoto,
  ]);

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
  };
}
