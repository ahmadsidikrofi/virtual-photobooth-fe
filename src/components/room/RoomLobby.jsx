"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LobbyHeader } from "./LobbyHeader";
import { LocalVideoStage } from "./LocalVideoStage";
import { PeerVideoStage } from "./PeerVideoStage";
import { PreShootControls } from "./PreShootControls";
import { PhotoCuratingScreen } from "./PhotoCuratingScreen";
import { StripDesignScreen } from "./StripDesignScreen";
import { MediaPermissionDialog } from "./MediaPermissionDialog";
import { usePhotoboothEngine } from "@/hooks/usePhotoboothEngine";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { saveCuratedSession, GRID_CONFIGS } from "@/lib/room";

export function RoomLobby({ roomId }) {
  const router = useRouter();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Global Room & Studio UI Store (Zustand)
  const studioMode = useRoomStore((s) => s.studioMode);
  const setStudioMode = useRoomStore((s) => s.setStudioMode);
  const copied = useRoomStore((s) => s.copied);
  const setCopied = useRoomStore((s) => s.setCopied);
  const isPeerJoined = useRoomStore((s) => s.isPeerJoined);
  const setIsPeerJoined = useRoomStore((s) => s.setIsPeerJoined);

  // Global Photobooth Session Store (Zustand)
  const sessionState = usePhotoboothStore((s) => s.sessionState);
  const setSessionState = usePhotoboothStore((s) => s.setSessionState);
  const selectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const selectedIndices = usePhotoboothStore((s) => s.selectedIndices);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);

  // Local media hardware state
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [isMicAvailable, setIsMicAvailable] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState("prompt");
  const [micPermission, setMicPermission] = useState("prompt");
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [permissionDialogMode, setPermissionDialogMode] = useState("camera");

  // 1. Photobooth Engine Hook (Hardware Capture Loop & Countdown Audio)
  const engine = usePhotoboothEngine({ videoRef });

  // Shareable Room URL
  const roomUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomId}`
      : `https://snapmate.app/room/${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Yuk foto bareng di Snapmate! Klik link ini buat masuk ke bilik foto kita:\n${roomUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // Setup Web Audio API volume analyser to detect when user is speaking
  const setupAudioMeter = useCallback((audioTrack) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const mediaStreamObj = new MediaStream([audioTrack]);
      const source = audioCtx.createMediaStreamSource(mediaStreamObj);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setIsSpeaking(average > 15);

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }

      checkVolume();
    } catch (err) {
      console.warn("Audio meter setup warning:", err);
    }
  }, []);

  // Attach active stream to video element
  const attachStreamToVideo = useCallback((stream) => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch((err) => {
        console.warn("Autoplay was prevented or pending user interaction:", err);
      });
    }
  }, []);

  const startMedia = async () => {
    setIsLoadingCamera(true);
    setCameraError(null);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    let combinedStream = new MediaStream();
    let videoStream = null;
    let audioStream = null;

    try {
      const fullStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      combinedStream = fullStream;
      videoStream = fullStream;
      setCameraActive(true);
      setCameraPermission("granted");
      setCameraError(null);

      const audioTrack = fullStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = micActive;
        setupAudioMeter(audioTrack);
        setIsMicAvailable(true);
        setMicPermission("granted");
      }
    } catch (fullErr) {
      console.warn("Permintaan gabungan kamera & mic gagal, mencoba terpisah:", fullErr);

      // 1. Coba kamera saja
      try {
        videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });
        videoStream.getVideoTracks().forEach((track) => combinedStream.addTrack(track));
        setCameraActive(true);
        setCameraPermission("granted");
        setCameraError(null);
      } catch (err) {
        console.error("Gagal mengakses kamera:", err);
        setCameraActive(false);
        const isDenied = err.name === "NotAllowedError" || err.name === "PermissionDeniedError";
        if (isDenied) {
          setCameraPermission("denied");
        }
        setCameraError(
          isDenied
            ? "Izin kamera ditolak di setelan browser. Silakan izinkan akses kamera di ikon gembok bilah browser Anda."
            : "Perangkat kamera tidak ditemukan atau sedang dipakai aplikasi lain."
        );
      }

      // 2. Coba mic saja
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        const audioTrack = audioStream.getAudioTracks()[0];
        if (audioTrack) {
          combinedStream.addTrack(audioTrack);
          audioTrack.enabled = micActive;
          setupAudioMeter(audioTrack);
          setIsMicAvailable(true);
          setMicPermission("granted");
        }
      } catch (err) {
        console.warn("Gagal mengakses mikrofon:", err);
        setIsMicAvailable(false);
        setMicActive(false);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setMicPermission("denied");
        }
      }
    }

    streamRef.current = combinedStream;
    setMediaStream(combinedStream);

    if (videoRef.current && combinedStream.getVideoTracks().length > 0) {
      attachStreamToVideo(combinedStream);
    }

    setIsLoadingCamera(false);
  };

  // Monitor real-time permission changes
  useEffect(() => {
    let cameraStatus = null;
    let micStatus = null;

    const initPermissionListeners = async () => {
      if (typeof navigator === "undefined" || !navigator.permissions?.query) return;

      try {
        cameraStatus = await navigator.permissions.query({ name: "camera" });
        setCameraPermission(cameraStatus.state);
        cameraStatus.onchange = () => {
          setCameraPermission(cameraStatus.state);
          if (cameraStatus.state === "granted") {
            setIsPermissionDialogOpen(false);
            startMedia();
          } else if (cameraStatus.state === "denied") {
            setCameraActive(false);
          }
        };
      } catch {}

      try {
        micStatus = await navigator.permissions.query({ name: "microphone" });
        setMicPermission(micStatus.state);
        micStatus.onchange = () => {
          setMicPermission(micStatus.state);
          if (micStatus.state === "granted") {
            setIsPermissionDialogOpen(false);
            startMedia();
          } else if (micStatus.state === "denied") {
            setMicActive(false);
            setIsMicAvailable(false);
          }
        };
      } catch {}
    };

    initPermissionListeners();

    return () => {
      if (cameraStatus) cameraStatus.onchange = null;
      if (micStatus) micStatus.onchange = null;
    };
  }, []);

  // Handler retry from MediaPermissionDialog
  const handleRetryPermission = async (targetMode) => {
    const needCamera = targetMode === "camera" || targetMode === "both";
    const needMic = targetMode === "mic" || targetMode === "both";

    if (needCamera && needMic) {
      try {
        const fullStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!streamRef.current) streamRef.current = new MediaStream();
        streamRef.current.getTracks().forEach((t) => {
          t.stop();
          streamRef.current.removeTrack(t);
        });

        fullStream.getTracks().forEach((t) => streamRef.current.addTrack(t));

        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }

        setCameraActive(true);
        setCameraPermission("granted");
        setCameraError(null);
        setMediaStream(streamRef.current);

        const aTrack = fullStream.getAudioTracks()[0];
        if (aTrack) {
          aTrack.enabled = true;
          setupAudioMeter(aTrack);
          setMicActive(true);
          setIsMicAvailable(true);
          setMicPermission("granted");
        }

        setIsPermissionDialogOpen(false);
        return true;
      } catch (err) {
        console.warn("Combined retry failed, trying individual fallbacks:", err);
      }
    }

    let camOk = true;
    let micOk = true;

    if (needCamera) {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });
        const newVideoTrack = videoStream.getVideoTracks()[0];
        if (newVideoTrack) {
          if (!streamRef.current) streamRef.current = new MediaStream();
          streamRef.current.getVideoTracks().forEach((t) => streamRef.current.removeTrack(t));
          streamRef.current.addTrack(newVideoTrack);
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
          setCameraPermission("granted");
          setCameraError(null);
          setMediaStream(streamRef.current);
        }
      } catch (err) {
        console.warn("Retry camera failed:", err);
        camOk = false;
        setCameraPermission("denied");
      }
    }

    if (needMic) {
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        const newAudioTrack = audioStream.getAudioTracks()[0];
        if (newAudioTrack) {
          if (!streamRef.current) streamRef.current = new MediaStream();
          streamRef.current.getAudioTracks().forEach((t) => streamRef.current.removeTrack(t));
          streamRef.current.addTrack(newAudioTrack);
          newAudioTrack.enabled = true;
          setupAudioMeter(newAudioTrack);
          setMicActive(true);
          setIsMicAvailable(true);
          setMicPermission("granted");
          setMediaStream(streamRef.current);
        }
      } catch (err) {
        console.warn("Retry mic failed:", err);
        micOk = false;
        setMicPermission("denied");
      }
    }

    const isSuccess = (needCamera ? camOk : true) && (needMic ? micOk : true);
    if (isSuccess) {
      setIsPermissionDialogOpen(false);
      return true;
    }
    return false;
  };

  const toggleCamera = async () => {
    if (cameraActive) {
      const videoTrack = streamRef.current?.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.stop();
        streamRef.current.removeTrack(videoTrack);
      }
      setCameraActive(false);
      setMediaStream(streamRef.current);
    } else {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });
        const newVideoTrack = videoStream.getVideoTracks()[0];
        if (newVideoTrack) {
          if (!streamRef.current) {
            streamRef.current = new MediaStream();
          }
          streamRef.current.addTrack(newVideoTrack);
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
          setCameraPermission("granted");
          setCameraError(null);
          setMediaStream(streamRef.current);
        }
      } catch (err) {
        console.error("Gagal menyalakan kamera:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraPermission("denied");
        }
      }
    }
  };

  const toggleMic = async () => {
    const currentAudioTrack = streamRef.current?.getAudioTracks()[0];

    if (currentAudioTrack) {
      const nextState = !micActive;
      currentAudioTrack.enabled = nextState;
      setMicActive(nextState);
      if (!nextState) {
        setIsSpeaking(false);
      }
      return;
    }

    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const newAudioTrack = audioStream.getAudioTracks()[0];
      if (newAudioTrack) {
        if (!streamRef.current) {
          streamRef.current = new MediaStream();
        }
        streamRef.current.addTrack(newAudioTrack);
        newAudioTrack.enabled = true;
        setupAudioMeter(newAudioTrack);
        setMicActive(true);
        setIsMicAvailable(true);
        setMicPermission("granted");
        setMediaStream(streamRef.current);
      }
    } catch (err) {
      console.warn("Izin mikrofon tidak diberikan:", err);
      setIsMicAvailable(false);
      setMicActive(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicPermission("denied");
      }
    }
  };

  const handleCameraBtnClick = () => {
    if (cameraPermission === "denied") {
      setPermissionDialogMode("camera");
      setIsPermissionDialogOpen(true);
      return;
    }
    toggleCamera();
  };

  const handleMicBtnClick = () => {
    if (micPermission === "denied") {
      setPermissionDialogMode("mic");
      setIsPermissionDialogOpen(true);
      return;
    }
    toggleMic();
  };

  const toggleMirror = () => {
    engine.toggleMirror();
  };

  // Auto-start camera & mic preview
  useEffect(() => {
    startMedia();
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Ensure stream attached when camera is active or when returning from curating to idle
  useEffect(() => {
    if (
      cameraActive &&
      streamRef.current &&
      sessionState !== "curating" &&
      sessionState !== "designing"
    ) {
      attachStreamToVideo(streamRef.current);
    }
  }, [cameraActive, sessionState, studioMode, attachStreamToVideo]);

  // Handle Proceed from Curating Screen -> Transition to Design & Export Screen
  const handleProceedToDesign = () => {
    const selectedPhotos = selectedIndices.map((idx) => capturedPhotos[idx]);
    saveCuratedSession(roomId, selectedLayout, selectedPhotos);
    setSessionState("designing");
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-fun-yellow/30 selection:text-ink animate-in fade-in duration-300">
      {/* 1. Header: Clean & Quiet */}
      <LobbyHeader
        roomId={roomId}
        copied={copied}
        onCopy={handleCopy}
        onExit={() => router.push("/")}
      />

      {/* 2. Main Studio Stage */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-5 sm:py-8 flex flex-col justify-center gap-5">
        {/* State A: Design & Export Screen (Layar Desain Strip & Pemilihan Bingkai) */}
        {sessionState === "designing" && (
          <StripDesignScreen
            roomId={roomId}
            studioMode={studioMode}
            onBackToCurate={() => setSessionState("curating")}
            onRetake={() => engine.resetSession()}
          />
        )}

        {/* State B: Curating Screen (Setelah 8 foto terkumpul) */}
        {sessionState === "curating" && (
          <PhotoCuratingScreen
            capturedPhotos={capturedPhotos}
            selectedIndices={selectedIndices}
            selectedLayout={selectedLayout}
            onToggleSelect={engine.toggleSelectPhoto}
            onReset={engine.resetSession}
            onProceed={handleProceedToDesign}
          />
        )}

        {/* State C: Studio Pre-Shoot & Viewfinder Stage (Tetap di DOM dengan hidden agar stream tidak terputus) */}
        <div
          className={
            sessionState === "curating" || sessionState === "designing"
              ? "hidden"
              : "flex flex-col gap-5"
          }
        >
          {/* Mode Switcher: Studio Solo vs Bilik Berdua */}
          <div className="flex items-center justify-between">
            <div className="flex items-center rounded-full bg-white p-1 border border-[#E6DFD5] shadow-2xs">
              <button
                type="button"
                onClick={() => setStudioMode("solo")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  studioMode === "solo"
                    ? "bg-[#1F1A16] text-white shadow-xs"
                    : "text-[#757068] hover:text-ink"
                }`}
              >
                Studio Solo
              </button>
              <button
                type="button"
                onClick={() => setStudioMode("duo")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  studioMode === "duo"
                    ? "bg-[#1F1A16] text-white shadow-xs"
                    : "text-[#757068] hover:text-ink"
                }`}
              >
                Bilik Berdua
              </button>
            </div>
          </div>

          {/* Viewfinder Screens: Container konsisten agar LocalVideoStage tidak unmount */}
          <div
            className={`grid gap-4 sm:gap-6 items-stretch ${
              studioMode === "solo"
                ? "grid-cols-1 max-w-2xl mx-auto w-full"
                : "grid-cols-1 md:grid-cols-2 w-full"
            }`}
          >
            <LocalVideoStage
              videoRef={videoRef}
              stream={mediaStream}
              cameraActive={cameraActive}
              isLoadingCamera={isLoadingCamera}
              cameraPermission={cameraPermission}
              cameraError={cameraError}
              isMirrored={engine.isMirrored}
              micActive={micActive}
              isMicAvailable={isMicAvailable}
              micPermission={micPermission}
              isSpeaking={isSpeaking}
              onToggleMirror={toggleMirror}
              onMicClick={handleMicBtnClick}
              onCameraClick={handleCameraBtnClick}
              onOpenPermissionDialog={() => {
                setPermissionDialogMode("camera");
                setIsPermissionDialogOpen(true);
              }}
              onStartMedia={startMedia}
              sessionState={engine.sessionState}
              countdownValue={engine.countdownValue}
              currentShot={engine.currentShot}
              transitionText={engine.transitionText}
            />

            {studioMode === "duo" && (
              <PeerVideoStage
                isPeerJoined={isPeerJoined}
                onShareWhatsApp={handleShareWhatsApp}
                onCopyLink={handleCopy}
                copied={copied}
                onToggleTestPeer={() => setIsPeerJoined((prev) => !prev)}
              />
            )}
          </div>

          {/* Pengaturan Pra-Foto: Tetap aktif dan dapat diakses di kedua mode (Solo & Berdua) */}
          <PreShootControls
            selectedLayout={engine.selectedLayout}
            onSelectLayout={engine.setSelectedLayout}
            timerDuration={engine.timerDuration}
            onSelectTimer={engine.setTimerDuration}
            isMirrored={engine.isMirrored}
            onToggleMirror={toggleMirror}
            onStartSession={engine.startSession}
            cameraActive={cameraActive}
            isLoadingCamera={isLoadingCamera}
          />
        </div>
      </main>

      {/* Modal Dialog Buka Izin Media */}
      <MediaPermissionDialog
        isOpen={isPermissionDialogOpen}
        onOpenChange={setIsPermissionDialogOpen}
        mode={permissionDialogMode}
        cameraPermission={cameraPermission}
        micPermission={micPermission}
        onRetry={handleRetryPermission}
      />
    </div>
  );
}
