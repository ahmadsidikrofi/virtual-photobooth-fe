"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { LobbyHeader } from "./LobbyHeader";
import { LocalVideoStage } from "./LocalVideoStage";
import { PeerVideoStage } from "./PeerVideoStage";
import { PreShootControls } from "./PreShootControls";
import { PhotoCuratingScreen } from "./PhotoCuratingScreen";
import { StripDesignScreen } from "./StripDesignScreen";
import { MediaPermissionDialog } from "./MediaPermissionDialog";
import { DeviceSettingsModal } from "./DeviceSettingsModal";
import { usePhotoboothEngine } from "@/hooks/usePhotoboothEngine";
import { usePeerRoom } from "@/hooks/usePeerRoom";
import { useHandGesture } from "@/hooks/useHandGesture";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";
import { useRoomStore } from "@/stores/useRoomStore";
import { saveCuratedSession, GRID_CONFIGS } from "@/lib/room";

export function RoomLobby({ roomId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const videoRef = localVideoRef;
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Global Room & Studio UI Store (Zustand)
  const studioMode = useRoomStore((s) => s.studioMode);
  const setStudioMode = useRoomStore((s) => s.setStudioMode);
  const copied = useRoomStore((s) => s.copied);
  const setCopied = useRoomStore((s) => s.setCopied);
  const hasPeerDisconnected = useRoomStore((s) => s.hasPeerDisconnected);

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

  // Device Selection & Hardware Enumeration State
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState("");
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState("");
  const [facingMode, setFacingMode] = useState("user"); // "user" | "environment"
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSwitchingDevice, setIsSwitchingDevice] = useState(false);
  const [isGestureEnabled, setIsGestureEnabled] = useState(false);

  // 1. Photobooth Engine Hook (Hardware Capture Loop & Countdown Audio)
  const engine = usePhotoboothEngine({
    localVideoRef,
    remoteVideoRef,
    totalShots: 8,
  });

  // 2. Real-time PeerJS WebRTC Connection Hook
  const {
    role,
    isHost,
    isGuest,
    isRoomFull,
    isPeerReady,
    isLocalReady,
    isPeerCameraActive,
    remoteStream,
    peerConnectionStatus,
    triggerRemoteStartSession,
    sendTriggerStart,
    syncSettings,
    toggleReady,
    leaveRoom,
    sendCameraState,
    handlePeerLeave,
  } = usePeerRoom({
    roomId,
    localStream: mediaStream,
    onRemoteStartSession: () => {
      engine.startSession();
    },
    onPeerDisconnect: () => {
      // Sesi foto dihentikan dan reset dari awal saat pasangan terputus
      engine.resetSession();
      useRoomStore.getState().setIsLocalReady(false);
    },
  });

  // Fungsi Mulai Sesi Foto Manual (Klik dari PreShootControls)
  const handleStartSession = useCallback(() => {
    if (studioMode === "duo" && isHost && remoteStream) {
      triggerRemoteStartSession();
    }
    engine.startSession();
  }, [studioMode, isHost, remoteStream, triggerRemoteStartSession, engine]);

  // Pemicu Mulai Hitung Mundur dari Deteksi Gestur Tangan
  const handleGestureTrigger = useCallback(
    ({ categoryName, emoji, setFeedback }) => {
      // 1. Gesture dari sisi Guest tetap terdeteksi, tapi JANGAN picu sesi berfoto (hanya Host yang bisa memicu)
      if (isGuest) {
        setFeedback(`Pose ${emoji} Terdeteksi! (Hanya Host yang dapat memulai foto)`);
        return;
      }

      // 2. Jika sesi tidak idle atau kamera belum siap, abaikan
      if (sessionState !== "idle" || !cameraActive || isLoadingCamera) {
        return;
      }

      // 3. Di mode Bilik Berdua:
      if (studioMode === "duo") {
        if (!remoteStream) {
          setFeedback(`Pose ${emoji} Terdeteksi! (Menunggu teman bergabung)`);
          return;
        }
        if (!isPeerCameraActive) {
          setFeedback(`Pose ${emoji} Terdeteksi! (Kamera teman belum aktif)`);
          return;
        }
        // Jika Guest belum klik tombol "Tandai Saya Siap Foto":
        // Jangan picu sesi foto, tetapi tetap deteksi gesturnya dan beri informasi
        if (!isPeerReady) {
          setFeedback(`Pose ${emoji} Terdeteksi! (Menunggu teman siap)`);
          return;
        }

        // Jika Guest sudah siap, kirim sinyal mulai ke pasangan
        sendTriggerStart();
      }

      // 4. Picu sesi foto jika semua syarat terpenuhi (Solo atau Duo saat Guest sudah siap)
      setFeedback(`Pose ${emoji} Terdeteksi! Bersiap...`);
      engine.startSession();
    },
    [
      isGuest,
      sessionState,
      cameraActive,
      isLoadingCamera,
      studioMode,
      remoteStream,
      isPeerCameraActive,
      isPeerReady,
      sendTriggerStart,
      engine,
    ]
  );

  // 3. Deteksi Gestur Tangan (MediaPipe Tasks-Vision)
  const { gestureFeedback, gestureHoldProgress, activeHoldGesture } = useHandGesture({
    videoRef: localVideoRef,
    isEnabled: isGestureEnabled,
    sessionState,
    cameraActive,
    onGestureTrigger: handleGestureTrigger,
  });

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
        audioContextRef.current.close().catch(() => { });
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
        audioCtx.resume().catch(() => { });
      }

      checkVolume();
    } catch (err) {
      console.warn("Audio meter setup warning:", err);
    }
  }, []);

  // Enumerasi daftar perangkat kamera dan mikrofon yang terhubung
  const updateDeviceList = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vDevices = devices.filter((d) => d.kind === "videoinput");
      const aDevices = devices.filter((d) => d.kind === "audioinput");
      setVideoDevices(vDevices);
      setAudioDevices(aDevices);
    } catch (err) {
      console.warn("Gagal mengenumerasi perangkat media:", err);
    }
  }, []);

  // Pantau perubahan perangkat (misal colok/cabut webcam USB)
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.addEventListener) return;
    navigator.mediaDevices.addEventListener("devicechange", updateDeviceList);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", updateDeviceList);
    };
  }, [updateDeviceList]);

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
  }, [videoRef]);

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

      const vTrack = fullStream.getVideoTracks()[0];
      if (vTrack) {
        const settings = vTrack.getSettings();
        if (settings.deviceId) setSelectedVideoDeviceId(settings.deviceId);
        if (settings.facingMode) setFacingMode(settings.facingMode);
      }

      const audioTrack = fullStream.getAudioTracks()[0];
      if (audioTrack) {
        const settings = audioTrack.getSettings();
        if (settings.deviceId) setSelectedAudioDeviceId(settings.deviceId);
        audioTrack.enabled = micActive;
        setupAudioMeter(audioTrack);
        setIsMicAvailable(true);
        setMicPermission("granted");
      }
      updateDeviceList();
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

        const vTrack = videoStream.getVideoTracks()[0];
        if (vTrack) {
          const settings = vTrack.getSettings();
          if (settings.deviceId) setSelectedVideoDeviceId(settings.deviceId);
          if (settings.facingMode) setFacingMode(settings.facingMode);
        }
        updateDeviceList();
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

          const settings = audioTrack.getSettings();
          if (settings.deviceId) setSelectedAudioDeviceId(settings.deviceId);
          updateDeviceList();
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
      } catch { }

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
      } catch { }
    };

    initPermissionListeners();

    return () => {
      if (cameraStatus) cameraStatus.onchange = null;
      if (micStatus) micStatus.onchange = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          videoRef.current.play().catch(() => { });
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
            videoRef.current.play().catch(() => { });
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
      const updatedStream = new MediaStream(streamRef.current ? streamRef.current.getTracks() : []);
      streamRef.current = updatedStream;
      setMediaStream(updatedStream);
      sendCameraState(false);
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
            videoRef.current.play().catch(() => { });
          }
          setCameraActive(true);
          setCameraPermission("granted");
          setCameraError(null);
          const updatedStream = new MediaStream(streamRef.current.getTracks());
          streamRef.current = updatedStream;
          setMediaStream(updatedStream);
          sendCameraState(true);
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

  // Fungsi Pergantian Perangkat Kamera & Mikrofon
  const switchMediaDevice = async ({
    videoDeviceId,
    audioDeviceId,
    targetFacingMode,
  }) => {
    setIsSwitchingDevice(true);
    setCameraError(null);

    const targetVideoId = videoDeviceId !== undefined ? videoDeviceId : selectedVideoDeviceId;
    const targetAudioId = audioDeviceId !== undefined ? audioDeviceId : selectedAudioDeviceId;
    const nextFacing = targetFacingMode !== undefined ? targetFacingMode : facingMode;

    const videoConstraints = {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    };

    if (targetFacingMode !== undefined && !videoDeviceId) {
      videoConstraints.facingMode = { ideal: targetFacingMode };
    } else if (targetVideoId) {
      videoConstraints.deviceId = { exact: targetVideoId };
    } else if (nextFacing) {
      videoConstraints.facingMode = { ideal: nextFacing };
    }

    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    if (targetAudioId) {
      audioConstraints.deviceId = { exact: targetAudioId };
    }

    try {
      let newStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: cameraActive || videoDeviceId !== undefined || targetFacingMode !== undefined ? videoConstraints : false,
          audio: isMicAvailable || micActive || audioDeviceId !== undefined ? audioConstraints : false,
        });
      } catch (exactErr) {
        console.warn("Exact device constraint failed, attempting fallback:", exactErr);
        const fallbackVideo = { ...videoConstraints };
        if (fallbackVideo.deviceId) {
          fallbackVideo.deviceId = targetVideoId;
        }
        const fallbackAudio = { ...audioConstraints };
        if (fallbackAudio.deviceId) {
          fallbackAudio.deviceId = targetAudioId;
        }
        newStream = await navigator.mediaDevices.getUserMedia({
          video: cameraActive || videoDeviceId !== undefined || targetFacingMode !== undefined ? fallbackVideo : false,
          audio: isMicAvailable || micActive || audioDeviceId !== undefined ? fallbackAudio : false,
        });
      }

      // Hentikan track lama untuk mencegah memory leak dan mematikan lampu webcam lama
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      streamRef.current = newStream;
      setMediaStream(newStream);

      if (localVideoRef.current && newStream.getVideoTracks().length > 0) {
        attachStreamToVideo(newStream);
      }

      setCameraActive(newStream.getVideoTracks().length > 0);
      setCameraPermission("granted");

      const newAudioTrack = newStream.getAudioTracks()[0];
      if (newAudioTrack) {
        newAudioTrack.enabled = micActive;
        setupAudioMeter(newAudioTrack);
        setIsMicAvailable(true);
        setMicPermission("granted");
      }

      const newVideoTrack = newStream.getVideoTracks()[0];
      if (newVideoTrack) {
        const settings = newVideoTrack.getSettings();
        if (settings.deviceId) setSelectedVideoDeviceId(settings.deviceId);
        const activeFacing = settings.facingMode || targetFacingMode || nextFacing;
        setFacingMode(activeFacing);

        // Aturan Cermin:
        // Jika kamera belakang (environment), otomatis matikan efek cermin.
        // Jika kamera depan (user), otomatis aktifkan efek cermin.
        const isRear =
          activeFacing === "environment" ||
          (newVideoTrack.label && /back|rear|belakang|environment/i.test(newVideoTrack.label));
        const isFront =
          activeFacing === "user" ||
          (newVideoTrack.label && /front|depan|user/i.test(newVideoTrack.label));

        if (isRear) {
          engine.setIsMirrored(false);
        } else if (isFront) {
          engine.setIsMirrored(true);
        }
      }

      if (newAudioTrack) {
        const settings = newAudioTrack.getSettings();
        if (settings.deviceId) setSelectedAudioDeviceId(settings.deviceId);
      }

      updateDeviceList();
      return true;
    } catch (err) {
      console.error("Gagal mengganti perangkat media:", err);
      setCameraError("Gagal menghubungkan ke perangkat yang dipilih.");
      return false;
    } finally {
      setIsSwitchingDevice(false);
    }
  };

  // Tombol Cepat Balik Kamera di Ponsel (Mobile Quick Flip)
  const handleQuickFlipCamera = async () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";

    let targetDeviceId = undefined;
    if (videoDevices.length > 1) {
      if (nextFacing === "environment") {
        const backCam = videoDevices.find((d) =>
          /back|rear|belakang|environment/i.test(d.label)
        );
        if (backCam) targetDeviceId = backCam.deviceId;
      } else {
        const frontCam = videoDevices.find((d) =>
          /front|depan|user/i.test(d.label)
        );
        if (frontCam) targetDeviceId = frontCam.deviceId;
      }

      if (!targetDeviceId && selectedVideoDeviceId) {
        const otherCam = videoDevices.find(
          (d) => d.deviceId !== selectedVideoDeviceId
        );
        if (otherCam) targetDeviceId = otherCam.deviceId;
      }
    }

    await switchMediaDevice({
      videoDeviceId: targetDeviceId,
      targetFacingMode: nextFacing,
    });
  };

  // Auto-start camera & mic preview
  useEffect(() => {
    const timer = setTimeout(() => {
      startMedia();
    }, 0);

    const handleBeforeUnload = () => {
      leaveRoom();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => { });
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // SPESIFIKASI: Tampilan Layar Blokir jika Ruangan Penuh (Maksimal 2 Orang)
  if (isRoomFull) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-ink flex flex-col items-center justify-center p-6 selection:bg-fun-yellow/30 selection:text-ink">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6DFD5] p-8 sm:p-10 shadow-sm flex flex-col items-center gap-5 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="size-16 rounded-full bg-[#E76F51]/10 text-[#E76F51] flex items-center justify-center border border-[#E76F51]/20">
            <Users className="size-8 stroke-[2.2]" />
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#1F1A16] tracking-tight">
              Ruangan Sedang Digunakan
            </h2>
            <p className="text-sm text-[#757068] leading-relaxed">
              Ruangan ini sudah mencapai batas maksimal 2 orang. Silakan buat ruangan baru.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
              }
              router.push("/");
            }}
            className="mt-2 w-full rounded-full bg-fun-yellow hover:bg-[#D98A12] text-[#1F1A16] font-extrabold py-3.5 px-6 text-sm transition-all shadow-xs cursor-pointer active:scale-95 hover:shadow-md"
          >
            Buat Ruangan Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-fun-yellow/30 selection:text-ink animate-in fade-in duration-300">
      {/* 1. Header: Clean & Quiet */}
      <LobbyHeader
        roomId={roomId}
        copied={copied}
        onCopy={handleCopy}
        onExit={() => {
          leaveRoom();
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
          }
          router.push("/");
        }}
        role={role}
        isConnected={Boolean(remoteStream)}
      />

      {/* 2. Main Studio Stage */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-5 sm:py-8 flex flex-col justify-center gap-5">
        {/* State A: Design & Export Screen (Layar Desain Strip & Pemilihan Bingkai) */}
        {sessionState === "designing" && (
          <StripDesignScreen
            roomId={roomId}
            studioMode={studioMode}
            isHost={isHost}
            isGuest={isGuest}
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
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${studioMode === "solo"
                  ? "bg-[#1F1A16] text-white shadow-xs"
                  : "text-[#757068] hover:text-ink"
                  }`}
              >
                Studio Solo
              </button>
              <button
                type="button"
                onClick={() => setStudioMode("duo")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${studioMode === "duo"
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
            className={`grid gap-4 sm:gap-6 items-stretch ${studioMode === "solo"
              ? "grid-cols-1 max-w-2xl mx-auto w-full"
              : "grid-cols-1 md:grid-cols-2 w-full"
              }`}
          >
            <LocalVideoStage
              videoRef={localVideoRef}
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
              onOpenSettings={() => setIsSettingsOpen(true)}
              onQuickFlipCamera={handleQuickFlipCamera}
              facingMode={facingMode}
              gestureFeedback={gestureFeedback}
              gestureHoldProgress={gestureHoldProgress}
              activeHoldGesture={activeHoldGesture}
              sessionState={engine.sessionState}
              countdownValue={engine.countdownValue}
              currentShot={engine.currentShot}
              transitionText={engine.transitionText}
            />

            {studioMode === "duo" && (
              <PeerVideoStage
                remoteVideoRef={remoteVideoRef}
                remoteStream={remoteStream}
                isPeerReady={isPeerReady}
                isPeerCameraActive={isPeerCameraActive}
                hasPeerDisconnected={hasPeerDisconnected}
                role={role}
                roomId={roomId}
                roomUrl={roomUrl}
                onPeerLeave={handlePeerLeave}
              />
            )}
          </div>

          {/* Pengaturan Pra-Foto: Tetap aktif dan dapat diakses di kedua mode (Solo & Berdua) */}
          <PreShootControls
            selectedLayout={engine.selectedLayout}
            onSelectLayout={(layout) => {
              engine.setSelectedLayout(layout);
              if (isHost) {
                syncSettings(layout, engine.timerDuration);
              }
            }}
            timerDuration={engine.timerDuration}
            onSelectTimer={(timer) => {
              engine.setTimerDuration(timer);
              if (isHost) {
                syncSettings(engine.selectedLayout, timer);
              }
            }}
            onStartSession={handleStartSession}
            isGestureEnabled={isGestureEnabled}
            cameraActive={cameraActive}
            isLoadingCamera={isLoadingCamera}
            isDuoMode={studioMode === "duo"}
            isHost={isHost}
            isGuest={isGuest}
            isPeerJoined={Boolean(remoteStream)}
            isPeerReady={isPeerReady}
            isLocalReady={isLocalReady}
            isPeerCameraActive={isPeerCameraActive}
            remoteStream={remoteStream}
            onToggleReady={toggleReady}
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

      {/* Modal Dialog Pemilihan Perangkat Kamera & Audio */}
      <DeviceSettingsModal
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        videoDevices={videoDevices}
        audioDevices={audioDevices}
        selectedVideoDeviceId={selectedVideoDeviceId}
        selectedAudioDeviceId={selectedAudioDeviceId}
        onSelectVideoDevice={(deviceId) =>
          switchMediaDevice({ videoDeviceId: deviceId })
        }
        onSelectAudioDevice={(deviceId) =>
          switchMediaDevice({ audioDeviceId: deviceId })
        }
        isMirrored={engine.isMirrored}
        onToggleMirror={toggleMirror}
        onQuickFlipCamera={handleQuickFlipCamera}
        facingMode={facingMode}
        isSwitchingDevice={isSwitchingDevice}
        isGestureEnabled={isGestureEnabled}
        onToggleGesture={() => setIsGestureEnabled((prev) => !prev)}
      />
    </div>
  );
}
