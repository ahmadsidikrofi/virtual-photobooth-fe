"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRoomStore } from "@/stores/useRoomStore";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";

// Konfigurasi WebRTC STUN & TURN multi-server untuk kehandalan NAT traversal di berbagai ISP (Wi-Fi, 4G/5G, Symmetric NAT)
const PEER_CONFIG = {
  iceServers: [
    // STUN Servers (Google & Cloudflare) - Ringkas dan cepat agar tidak memenuhi tabel NAT router Wi-Fi
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
    // TURN Relay Servers (Open Relay Project by Metered.ca)
    // Berfungsi meneruskan paket video & data saat terhalang Symmetric NAT / data seluler 4G/5G
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turns:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

// Helper: Buat video track fallback (kanvas 640x480) untuk memastikan SDP WebRTC
// selalu menegosiasikan transceiver video 'sendrecv' dua arah. Dengan demikian,
// saat kamera lokal dihidupkan, replaceTrack dapat langsung mentransmisikan video
// tanpa terhambat status 'recvonly' atau penolakan m-line di SDP awal.
function createEmptyVideoTrack(width = 640, height = 480) {
  if (typeof document === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, width, height);
    }
    const stream = canvas.captureStream ? canvas.captureStream(1) : null;
    const track = stream?.getVideoTracks()[0];
    if (track) {
      track.enabled = false;
      return track;
    }
  } catch (e) {
    console.warn("[PeerJS] Gagal membuat fallback video track:", e);
  }
  return null;
}

// Helper: Buat audio track hening untuk memastikan transceiver audio 'sendrecv' selalu tersedia
function createEmptyAudioTrack() {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    osc.connect(dst);
    osc.start();
    const track = dst.stream.getAudioTracks()[0];
    if (track) {
      track.enabled = false;
      return track;
    }
  } catch (e) {
    console.warn("[PeerJS] Gagal membuat fallback audio track:", e);
  }
  return null;
}

// Helper: Memastikan stream yang dikirim ke peer selalu memiliki minimal 1 track video dan 1 track audio
function ensureStreamWithBothTracks(sourceStream) {
  const tracks = [];
  const videoTrack = sourceStream?.getVideoTracks()[0] || createEmptyVideoTrack();
  if (videoTrack) tracks.push(videoTrack);

  const audioTrack = sourceStream?.getAudioTracks()[0] || createEmptyAudioTrack();
  if (audioTrack) tracks.push(audioTrack);

  return new MediaStream(tracks);
}

// Toleransi waktu gangguan jaringan sesaat (buffer toleransi) sebelum menyatakan koneksi putus permanen.
// Diberikan 14000ms (14 detik) agar router Wi-Fi lokal punya cukup waktu untuk menyelesaikan
// proses fallback dari kandidat STUN langsung ke Server TURN Relay tanpa memutus sesi pengguna secara prematur.
const DISCONNECT_GRACE_PERIOD_MS = 14000;

export function usePeerRoom({ roomId, localStream, onRemoteStartSession, onPeerDisconnect }) {
  // Zustand Room Store selectors
  const role = useRoomStore((s) => s.role);
  const activeGuestId = useRoomStore((s) => s.activeGuestId);
  const isRoomFull = useRoomStore((s) => s.isRoomFull);
  const isPeerJoined = useRoomStore((s) => s.isPeerJoined);
  const isPeerReady = useRoomStore((s) => s.isPeerReady);
  const isLocalReady = useRoomStore((s) => s.isLocalReady);
  const remoteStream = useRoomStore((s) => s.remoteStream);
  const peerConnectionStatus = useRoomStore((s) => s.peerConnectionStatus);
  const isPeerCameraActive = useRoomStore((s) => s.isPeerCameraActive);

  const setRole = useRoomStore((s) => s.setRole);
  const setActiveGuestId = useRoomStore((s) => s.setActiveGuestId);
  const setIsRoomFull = useRoomStore((s) => s.setIsRoomFull);
  const setIsPeerJoined = useRoomStore((s) => s.setIsPeerJoined);
  const setIsPeerReady = useRoomStore((s) => s.setIsPeerReady);
  const setIsLocalReady = useRoomStore((s) => s.setIsLocalReady);
  const setRemoteStream = useRoomStore((s) => s.setRemoteStream);
  const setPeerConnectionStatus = useRoomStore((s) => s.setPeerConnectionStatus);
  const setIsPeerCameraActive = useRoomStore((s) => s.setIsPeerCameraActive);
  const setHasPeerDisconnected = useRoomStore((s) => s.setHasPeerDisconnected);
  const resetPeerState = useRoomStore((s) => s.resetPeerState);

  // Photobooth Store selectors
  const setSelectedLayout = usePhotoboothStore((s) => s.setSelectedLayout);
  const setTimerDuration = usePhotoboothStore((s) => s.setTimerDuration);

  // Internal refs
  const peerRef = useRef(null);
  const connRef = useRef(null);
  const callRef = useRef(null);
  const localStreamRef = useRef(localStream);
  const isDestroyedRef = useRef(false);
  const hostIdRef = useRef(null);
  const roleRef = useRef(role);
  const activeGuestIdRef = useRef(activeGuestId);
  const isLocalReadyRef = useRef(isLocalReady);
  const onRemoteStartSessionRef = useRef(onRemoteStartSession);
  const onPeerDisconnectRef = useRef(onPeerDisconnect);
  const disconnectTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    roleRef.current = role;
  }, [role]);

  useEffect(() => {
    activeGuestIdRef.current = activeGuestId;
  }, [activeGuestId]);

  useEffect(() => {
    isLocalReadyRef.current = isLocalReady;
  }, [isLocalReady]);

  useEffect(() => {
    onRemoteStartSessionRef.current = onRemoteStartSession;
  }, [onRemoteStartSession]);

  useEffect(() => {
    onPeerDisconnectRef.current = onPeerDisconnect;
  }, [onPeerDisconnect]);

  // Send data safely via DataConnection
  const sendData = useCallback((payload) => {
    if (connRef.current && connRef.current.open) {
      try {
        connRef.current.send(payload);
      } catch (err) {
        console.warn("[PeerJS] Error sending data payload:", err);
      }
    }
  }, []);

  // Aksi siaran: Perubahan status kamera aktif/nonaktif
  const sendCameraState = useCallback(
    (enabled) => {
      sendData({
        type: "CAMERA_STATE",
        enabled: Boolean(enabled),
      });
    },
    [sendData]
  );

  // Helper sentral saat teman meninggalkan ruangan / koneksi terputus permanen
  const handlePeerDisconnect = useCallback(() => {
    console.log("[PeerJS] Pasangan meninggalkan ruangan / terputus permanen.");
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    if (roleRef.current === "host") {
      activeGuestIdRef.current = null;
      setActiveGuestId(null);
    }
    setRemoteStream(null);
    setIsPeerJoined(false);
    setIsPeerReady(false);
    setIsPeerCameraActive(true);
    setHasPeerDisconnected(true);
    setPeerConnectionStatus(roleRef.current === "host" ? "connected" : "disconnected");

    if (callRef.current) {
      try {
        callRef.current.close();
      } catch {}
      callRef.current = null;
    }
    if (connRef.current) {
      try {
        connRef.current.close();
      } catch {}
      connRef.current = null;
    }

    if (onPeerDisconnectRef.current) {
      onPeerDisconnectRef.current();
    }
  }, [setRemoteStream, setIsPeerJoined, setIsPeerReady, setIsPeerCameraActive, setHasPeerDisconnected, setPeerConnectionStatus, setActiveGuestId]);

  // Bersihkan buffer grace period saat koneksi pulih normal
  const clearDisconnectGracePeriod = useCallback(() => {
    if (disconnectTimerRef.current) {
      console.log("[PeerJS] Koneksi stabil kembali, membatalkan grace period.");
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    setPeerConnectionStatus("connected");
  }, [setPeerConnectionStatus]);

  // Mulai buffer toleransi saat terjadi jitter jaringan sementara
  const startDisconnectGracePeriod = useCallback(
    (reason = "Koneksi tidak stabil") => {
      console.warn(`[PeerJS] Indikasi gangguan koneksi (${reason}). Memulai grace period ${DISCONNECT_GRACE_PERIOD_MS}ms...`);
      setPeerConnectionStatus("reconnecting");

      if (!disconnectTimerRef.current) {
        disconnectTimerRef.current = setTimeout(() => {
          console.error(`[PeerJS] Grace period (${DISCONNECT_GRACE_PERIOD_MS}ms) habis tanpa pemulihan. Menghentikan sesi.`);
          disconnectTimerRef.current = null;
          handlePeerDisconnect();
        }, DISCONNECT_GRACE_PERIOD_MS);
      }
    },
    [handlePeerDisconnect, setPeerConnectionStatus]
  );

  // Setup MediaCall handlers (MURNI stream remote, bukan tiruan)
  const setupMediaCall = useCallback(
    (call) => {
      callRef.current = call;

      call.on("stream", (incomingStream) => {
        // Stream asli dari browser pasangan
        setRemoteStream(incomingStream);
        setIsPeerJoined(true);
        setHasPeerDisconnected(false);
        clearDisconnectGracePeriod();

        // Dengarkan status track video/audio remote
        incomingStream.getTracks().forEach((track) => {
          track.onmute = () => {
            console.log("[PeerJS] Remote track muted (packet drop / network pause):", track.kind);
          };
          track.onunmute = () => {
            console.log("[PeerJS] Remote track unmuted (packet resumed):", track.kind);
            clearDisconnectGracePeriod();
          };
          track.onended = () => {
            console.log("[PeerJS] Remote track berakhir (onended):", track.kind);
            // Jangan putuskan ruangan jika DataConnection masih aktif terbuka
            if (connRef.current && connRef.current.open) {
              if (track.kind === "video") {
                setIsPeerCameraActive(false);
              }
              return;
            }
            startDisconnectGracePeriod("Semua track berakhir tanpa DataConnection aktif");
          };
        });
      });

      call.on("close", () => {
        console.log("[PeerJS] MediaCall ditutup.");
        // Jika DataConnection masih terbuka, jangan bunuh room seketika!
        if (connRef.current && connRef.current.open) {
          startDisconnectGracePeriod("MediaCall closed namun DataConnection masih open");
          // Jika kita adalah guest, coba re-call host
          if (roleRef.current === "guest" && peerRef.current && !peerRef.current.destroyed && hostIdRef.current) {
            try {
              console.log("[PeerJS] Tamu mencoba memanggil ulang MediaCall ke Host...");
              const streamToSend = ensureStreamWithBothTracks(localStreamRef.current);
              const newCall = peerRef.current.call(hostIdRef.current, streamToSend);
              if (newCall) setupMediaCallRef.current(newCall);
            } catch (err) {
              console.warn("[PeerJS] Gagal re-call:", err);
            }
          }
          return;
        }
        handlePeerDisconnect();
      });

      call.on("error", (err) => {
        console.warn("[PeerJS] MediaCall error:", err);
        startDisconnectGracePeriod("MediaCall error");
      });

      // Pantau RTCPeerConnection untuk pemulihan dan penangkapan track baru
      const pc = call.peerConnection;
      if (pc) {
        pc.ontrack = (event) => {
          console.log("[PeerJS MediaCall] Native ontrack received:", event.track.kind, event.track.id);
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          } else {
            const current = useRoomStore.getState().remoteStream;
            const targetStream = current ? new MediaStream(current.getTracks()) : new MediaStream();
            if (!targetStream.getTracks().some((t) => t.id === event.track.id)) {
              targetStream.addTrack(event.track);
            }
            setRemoteStream(targetStream);
          }
          setIsPeerJoined(true);
          setHasPeerDisconnected(false);
          clearDisconnectGracePeriod();
        };
        pc.onconnectionstatechange = () => {
          console.log("[PeerJS MediaCall] RTCPeerConnection state:", pc.connectionState);
          if (pc.connectionState === "connected") {
            clearDisconnectGracePeriod();
          } else if (pc.connectionState === "disconnected") {
            startDisconnectGracePeriod("MediaCall connectionState disconnected");
          } else if (pc.connectionState === "failed") {
            try {
              if (typeof pc.restartIce === "function") {
                pc.restartIce();
              }
            } catch {}
            startDisconnectGracePeriod("MediaCall connectionState failed");
            if (roleRef.current === "guest" && peerRef.current && !peerRef.current.destroyed && hostIdRef.current) {
              try {
                console.log("[PeerJS] Guest melakukan re-call otomatis ke Host setelah MediaCall connectionState failed...");
                try { call.close(); } catch {}
                const streamToSend = ensureStreamWithBothTracks(localStreamRef.current);
                const newCall = peerRef.current.call(hostIdRef.current, streamToSend);
                if (newCall) setupMediaCallRef.current(newCall);
              } catch (reErr) {
                console.warn("[PeerJS] Gagal auto re-call:", reErr);
              }
            }
          } else if (pc.connectionState === "closed") {
            if (!connRef.current || !connRef.current.open) {
              handlePeerDisconnect();
            }
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log("[PeerJS MediaCall] ICE connectionState:", pc.iceConnectionState);
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            clearDisconnectGracePeriod();
          } else if (pc.iceConnectionState === "disconnected") {
            startDisconnectGracePeriod("MediaCall ICE disconnected");
          } else if (pc.iceConnectionState === "failed") {
            try {
              if (typeof pc.restartIce === "function") {
                pc.restartIce();
              }
            } catch {}
            startDisconnectGracePeriod("MediaCall ICE failed");
            if (roleRef.current === "guest" && peerRef.current && !peerRef.current.destroyed && hostIdRef.current) {
              try {
                console.log("[PeerJS] Guest melakukan re-call otomatis ke Host setelah MediaCall ICE failed...");
                try { call.close(); } catch {}
                const streamToSend = ensureStreamWithBothTracks(localStreamRef.current);
                const newCall = peerRef.current.call(hostIdRef.current, streamToSend);
                if (newCall) setupMediaCallRef.current(newCall);
              } catch (reErr) {
                console.warn("[PeerJS] Gagal auto re-call:", reErr);
              }
            }
          }
        };
      }
    },
    [
      setRemoteStream,
      setIsPeerJoined,
      clearDisconnectGracePeriod,
      startDisconnectGracePeriod,
      handlePeerDisconnect,
      setHasPeerDisconnected,
      setIsPeerCameraActive,
    ]
  );

  // Setup DataConnection handlers
  const setupDataConnection = useCallback(
    (conn) => {
      connRef.current = conn;

      conn.on("open", () => {
        setIsPeerJoined(true);
        setHasPeerDisconnected(false);
        clearDisconnectGracePeriod();

        const hasActiveVideo = Boolean(
          localStreamRef.current?.getVideoTracks().some((t) => t.enabled)
        );

        // Jika Host: kirimkan pengaturan studio saat ini ke tamu
        if (roleRef.current === "host") {
          const currentStore = usePhotoboothStore.getState();
          sendData({
            type: "SYNC_SETTINGS",
            layout: currentStore.selectedLayout,
            timerDuration: currentStore.timerDuration,
            cameraActive: hasActiveVideo,
          });
        } else {
          // Jika Guest: kirim sinyal telah bergabung dan status siap
          sendData({
            type: "GUEST_JOINED",
            isReady: isLocalReadyRef.current,
            cameraActive: hasActiveVideo,
          });

          // Setelah DataConnection stabil dan terbuka, panggil Host membawa stream video lokal jika belum dipanggil
          if (roleRef.current === "guest" && peerRef.current && !callRef.current && hostIdRef.current) {
            try {
              console.log("[PeerJS] DataConnection siap. Memulai panggilan MediaCall ke Host...");
              const streamToSend = ensureStreamWithBothTracks(localStreamRef.current);
              const call = peerRef.current.call(hostIdRef.current, streamToSend);
              if (call) setupMediaCallRef.current(call);
            } catch (callErr) {
              console.warn("[PeerJS] Gagal memanggil host via MediaCall:", callErr);
            }
          }

          // Mulai heartbeat ping/pong berkala untuk mencegah router Wi-Fi memutus sesi karena idle NAT timeout
          if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = setInterval(() => {
            if (connRef.current && connRef.current.open) {
              try {
                connRef.current.send({ type: "HEARTBEAT_PING", t: Date.now() });
              } catch {}
            }
          }, 3000);
        }
      });

      conn.on("data", (data) => {
        if (!data || typeof data !== "object") return;

        // SPESIFIKASI: Tamu menerima sinyal ROOM_FULL dari Host
        if (data.type === "ROOM_FULL") {
          console.warn("[PeerJS] Sinyal ROOM_FULL diterima: Ruangan sudah mencapai batas maksimal.");
          setIsRoomFull(true);
          setPeerConnectionStatus("failed");
          setRemoteStream(null);
          setIsPeerJoined(false);

          try {
            conn.close();
          } catch {}
          try {
            callRef.current?.close();
          } catch {}
          try {
            peerRef.current?.destroy();
          } catch {}
          return;
        }

        switch (data.type) {
          case "HEARTBEAT_PING":
            clearDisconnectGracePeriod();
            if (connRef.current && connRef.current.open) {
              try {
                connRef.current.send({ type: "HEARTBEAT_PONG", t: data.t });
              } catch {}
            }
            break;

          case "HEARTBEAT_PONG":
            clearDisconnectGracePeriod();
            break;

          case "GUEST_JOINED":
            setIsPeerJoined(true);
            clearDisconnectGracePeriod();
            if (typeof data.isReady === "boolean") {
              setIsPeerReady(data.isReady);
            }
            if (typeof data.cameraActive === "boolean") {
              setIsPeerCameraActive(data.cameraActive);
            }
            // Kirim balik pengaturan studio mutakhir
            {
              const currentStore = usePhotoboothStore.getState();
              sendData({
                type: "SYNC_SETTINGS",
                layout: currentStore.selectedLayout,
                timerDuration: currentStore.timerDuration,
                cameraActive: Boolean(
                  localStreamRef.current?.getVideoTracks().some((t) => t.enabled)
                ),
              });
            }
            break;

          case "SYNC_SETTINGS":
            if (data.layout) {
              setSelectedLayout(data.layout);
            }
            if (data.timerDuration) {
              setTimerDuration(data.timerDuration);
            }
            if (typeof data.cameraActive === "boolean") {
              setIsPeerCameraActive(data.cameraActive);
            }
            break;

          case "CAMERA_STATE":
            if (typeof data.enabled === "boolean") {
              setIsPeerCameraActive(data.enabled);
            }
            break;

          case "PEER_READY":
            setIsPeerReady(Boolean(data.isReady));
            break;

          case "TRIGGER_START":
          case "START_SESSION":
            if (onRemoteStartSessionRef.current) {
              onRemoteStartSessionRef.current();
            }
            break;

          case "PEER_LEAVE":
            console.log("[PeerJS] Menerima sinyal PEER_LEAVE dari pasangan.");
            handlePeerDisconnect();
            break;

          default:
            break;
        }
      });

      conn.on("close", () => {
        console.log("[PeerJS] DataConnection ditutup.");
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        if (callRef.current && callRef.current.open) {
          startDisconnectGracePeriod("DataConnection closed namun MediaCall masih open");
          return;
        }
        handlePeerDisconnect();
      });

      conn.on("error", (err) => {
        console.warn("[PeerJS] DataConnection error:", err);
        startDisconnectGracePeriod("DataConnection error");
      });

      const pc = conn.peerConnection;
      if (pc) {
        pc.onconnectionstatechange = () => {
          console.log("[PeerJS DataConn] RTCPeerConnection state:", pc.connectionState);
          if (pc.connectionState === "connected") {
            clearDisconnectGracePeriod();
          } else if (pc.connectionState === "disconnected") {
            startDisconnectGracePeriod("DataConn connectionState disconnected");
          } else if (pc.connectionState === "failed") {
            if (callRef.current && callRef.current.open) {
              console.warn("[PeerJS DataConn] DataConn connectionState failed tapi MediaCall masih aktif. Pertahankan sesi.");
              return;
            }
            startDisconnectGracePeriod("DataConn connectionState failed");
          } else if (pc.connectionState === "closed") {
            if (!callRef.current || !callRef.current.open) {
              handlePeerDisconnect();
            }
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            clearDisconnectGracePeriod();
          } else if (pc.iceConnectionState === "disconnected") {
            startDisconnectGracePeriod("DataConn ICE disconnected");
          } else if (pc.iceConnectionState === "failed") {
            if (callRef.current && callRef.current.open) {
              console.warn("[PeerJS DataConn] DataConn ICE failed tapi MediaCall masih aktif. Pertahankan sesi.");
              return;
            }
            startDisconnectGracePeriod("DataConn ICE failed");
          }
        };
      }
    },
    [
      sendData,
      setIsPeerJoined,
      clearDisconnectGracePeriod,
      startDisconnectGracePeriod,
      setIsPeerReady,
      setSelectedLayout,
      setTimerDuration,
      setRemoteStream,
      setIsRoomFull,
      handlePeerDisconnect,
      setHasPeerDisconnected,
      setIsPeerCameraActive,
    ]
  );

  const setupMediaCallRef = useRef(setupMediaCall);
  const setupDataConnectionRef = useRef(setupDataConnection);

  useEffect(() => {
    setupMediaCallRef.current = setupMediaCall;
  }, [setupMediaCall]);

  useEffect(() => {
    setupDataConnectionRef.current = setupDataConnection;
  }, [setupDataConnection]);

  // Perubahan local camera stream (misal setelah izin kamera diberikan atau kamera dinyalakan/dimatikan)
  useEffect(() => {
    localStreamRef.current = localStream;
    const videoTrack = localStream?.getVideoTracks()[0] || null;
    const audioTrack = localStream?.getAudioTracks()[0] || null;
    const hasVideo = Boolean(videoTrack && videoTrack.enabled);

    // Kirimkan status kamera langsung ke pasangan
    sendCameraState(hasVideo);

    const currentCall = callRef.current;
    if (currentCall && currentCall.peerConnection) {
      const pc = currentCall.peerConnection;
      if (pc.getTransceivers) {
        pc.getTransceivers().forEach((transceiver) => {
          if (transceiver.sender) {
            const kind = transceiver.receiver?.track?.kind || transceiver.sender.track?.kind;
            if (kind === "video" && videoTrack) {
              transceiver.sender.replaceTrack(videoTrack).catch((err) => {
                console.warn("[PeerJS] replaceTrack video error:", err);
              });
            } else if (kind === "audio" && audioTrack) {
              transceiver.sender.replaceTrack(audioTrack).catch((err) => {
                console.warn("[PeerJS] replaceTrack audio error:", err);
              });
            }
          }
        });
      } else if (pc.getSenders) {
        const senders = pc.getSenders();
        senders.forEach((sender) => {
          if (sender.track?.kind === "video" && videoTrack) {
            sender.replaceTrack(videoTrack).catch(() => {});
          } else if (sender.track?.kind === "audio" && audioTrack) {
            sender.replaceTrack(audioTrack).catch(() => {});
          }
        });
      }
    } else if (
      roleRef.current === "guest" &&
      peerRef.current &&
      !peerRef.current.destroyed &&
      hostIdRef.current &&
      !callRef.current &&
      connRef.current &&
      connRef.current.open
    ) {
      // Guest memanggil Host begitu localStream tersedia
      try {
        console.log("[PeerJS] LocalStream siap, tamu memulai panggilan ke Host...");
        const streamToSend = ensureStreamWithBothTracks(localStream);
        const call = peerRef.current.call(hostIdRef.current, streamToSend);
        if (call) setupMediaCallRef.current(call);
      } catch (err) {
        console.warn("[PeerJS] Gagal memanggil host:", err);
      }
    }
  }, [localStream, sendCameraState]);

  // Inisialisasi PeerJS di sisi Client
  useEffect(() => {
    if (typeof window === "undefined" || !roomId) return;

    isDestroyedRef.current = false;
    setPeerConnectionStatus("connecting");
    setIsRoomFull(false);

    const cleanRoomId = roomId.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const targetHostId = `snapmate-${cleanRoomId}-host`;
    hostIdRef.current = targetHostId;

    let localPeer = null;

    const initPeer = async () => {
      try {
        const { default: Peer } = await import("peerjs");

        if (isDestroyedRef.current) return;

        // Cegah duplikasi instans jika sudah ada koneksi aktif di room ini
        if (peerRef.current && !peerRef.current.destroyed && !peerRef.current.disconnected) {
          return;
        }

        const isCreatorHost =
          typeof window !== "undefined" &&
          (sessionStorage.getItem(`snapmate_host_${cleanRoomId}`) === "true" ||
            new URLSearchParams(window.location.search).get("host") === "1");

        if (isCreatorHost) {
          // ==========================================
          // ALUR HOST: Mendaftar dengan ID target deterministik
          // ==========================================
          localPeer = new Peer(targetHostId, {
            config: PEER_CONFIG,
            debug: 1,
          });
          peerRef.current = localPeer;

          localPeer.on("open", () => {
            if (isDestroyedRef.current) return;
            console.log("[PeerJS] Host berhasil terdaftar dengan ID:", targetHostId);
            setRole("host");
            setPeerConnectionStatus("connected");
            activeGuestIdRef.current = null;
            setActiveGuestId(null);
            setRemoteStream(null);
            setIsPeerJoined(false);
          });

          // Host mendengarkan koneksi data masuk dengan batas maksimal 2 orang
          localPeer.on("connection", (conn) => {
            if (isDestroyedRef.current) return;

            // Tolak koneksi dari diri sendiri
            if (conn.peer === localPeer.id || (peerRef.current && conn.peer === peerRef.current.id)) {
              console.warn("[PeerJS] Mengabaikan koneksi ke diri sendiri:", conn.peer);
              try { conn.close(); } catch {}
              return;
            }

            // Cek jika sudah ada tamu lain yang benar-benar aktif terhubung (connRef terbuka)
            const isOtherGuestActive =
              connRef.current &&
              connRef.current.open &&
              activeGuestIdRef.current &&
              activeGuestIdRef.current !== conn.peer;

            if (isOtherGuestActive) {
              console.warn(
                `[PeerJS] Ruangan penuh. Menolak tamu baru (${conn.peer}). Tamu aktif: ${activeGuestIdRef.current}`
              );

              const rejectAndDisconnect = () => {
                try { conn.send({ type: "ROOM_FULL" }); } catch {}
                setTimeout(() => { try { conn.close(); } catch {} }, 500);
              };

              if (conn.open) {
                rejectAndDisconnect();
              } else {
                conn.on("open", rejectAndDisconnect);
              }
              return;
            }

            // Simpan tamu ini (baik tamu pertama atau setelah tamu lama me-refresh halaman)
            console.log("[PeerJS] Host menerima DataConnection dari tamu:", conn.peer);
            activeGuestIdRef.current = conn.peer;
            setActiveGuestId(conn.peer);
            setupDataConnectionRef.current(conn);
          });

          // Host mendengarkan panggilan video masuk
          localPeer.on("call", (incomingCall) => {
            if (isDestroyedRef.current) return;

            if (
              incomingCall.peer === localPeer.id ||
              (peerRef.current && incomingCall.peer === peerRef.current.id)
            ) {
              console.warn("[PeerJS] Mengabaikan panggilan dari diri sendiri:", incomingCall.peer);
              try { incomingCall.close(); } catch {}
              return;
            }

            const isOtherGuestActive =
              connRef.current &&
              connRef.current.open &&
              activeGuestIdRef.current &&
              activeGuestIdRef.current !== incomingCall.peer;

            if (isOtherGuestActive) {
              console.warn("[PeerJS] Menolak stream video dari tamu tidak sah:", incomingCall.peer);
              try { incomingCall.close(); } catch {}
              return;
            }

            console.log("[PeerJS] Host menerima panggilan MediaCall dari tamu:", incomingCall.peer);
            activeGuestIdRef.current = incomingCall.peer;
            setActiveGuestId(incomingCall.peer);

            const streamToSend = ensureStreamWithBothTracks(localStreamRef.current);
            incomingCall.answer(streamToSend);
            setupMediaCallRef.current(incomingCall);
          });

          localPeer.on("disconnected", () => {
            console.warn("[PeerJS] Host terputus dari server sinyal cloud. Mencoba menyambung kembali...");
            if (!isDestroyedRef.current && localPeer && !localPeer.destroyed) {
              setTimeout(() => {
                try {
                  if (!localPeer.destroyed && localPeer.disconnected) {
                    localPeer.reconnect();
                  }
                } catch (e) {
                  console.warn("[PeerJS] Host reconnect error:", e);
                }
              }, 1200);
            }
          });

          localPeer.on("error", (err) => {
            if (isDestroyedRef.current) return;

            if (err.type === "unavailable-id") {
              try { localPeer.destroy(); } catch {}
              console.warn("[PeerJS] Host ID masih dilepas server cloud. Mencoba ulang dalam 800ms...");
              setTimeout(() => {
                if (!isDestroyedRef.current) {
                  initPeer();
                }
              }, 800);
              return;
            }
            console.warn("[PeerJS] Host peer error:", err);
            setPeerConnectionStatus("failed");
          });
        } else {
          // ==========================================
          // ALUR GUEST: Langsung mendaftar dengan ID unik (tanpa tabrakan ID Host)
          // ==========================================
          console.log("[PeerJS] Mendaftar sebagai Tamu (Guest)...");
          const guestPeer = new Peer(undefined, {
            config: PEER_CONFIG,
            debug: 1,
          });
          peerRef.current = guestPeer;

          guestPeer.on("open", () => {
            if (isDestroyedRef.current) return;
            console.log("[PeerJS] Tamu berhasil terdaftar dengan ID unik:", guestPeer.id);

            setRole("guest");
            setPeerConnectionStatus("connecting");
            setRemoteStream(null);
            setIsPeerJoined(false);

            // 1. Guest membuat Data Connection ke Host terlebih dahulu
            console.log("[PeerJS] Tamu membuka DataConnection ke Host:", targetHostId);
            const conn = guestPeer.connect(targetHostId);
            setupDataConnectionRef.current(conn);
          });

          guestPeer.on("call", (incomingCall) => {
            if (isDestroyedRef.current) return;
            if (
              incomingCall.peer === guestPeer.id ||
              (peerRef.current && incomingCall.peer === peerRef.current.id)
            ) {
              try { incomingCall.close(); } catch {}
              return;
            }
            const streamToSend = ensureStreamWithBothTracks(localStreamRef.current);
            incomingCall.answer(streamToSend);
            setupMediaCallRef.current(incomingCall);
          });

          guestPeer.on("disconnected", () => {
            console.warn("[PeerJS] Tamu terputus dari server sinyal cloud. Mencoba menyambung kembali...");
            if (!isDestroyedRef.current && guestPeer && !guestPeer.destroyed) {
              setTimeout(() => {
                try {
                  if (!guestPeer.destroyed && guestPeer.disconnected) {
                    guestPeer.reconnect();
                  }
                } catch (e) {
                  console.warn("[PeerJS] Guest reconnect error:", e);
                }
              }, 1200);
            }
          });

          guestPeer.on("error", (guestErr) => {
            console.warn("[PeerJS] Guest peer error:", guestErr);
            if (guestErr.type === "peer-unavailable") {
              console.warn("[PeerJS] Host belum online di ruangan ini.");
            }
            setPeerConnectionStatus("failed");
          });
        }
      } catch (e) {
        console.error("[PeerJS] Gagal inisialisasi peer:", e);
        setPeerConnectionStatus("failed");
      }
    };

    initPeer();

    return () => {
      isDestroyedRef.current = true;
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      if (disconnectTimerRef.current) {
        clearTimeout(disconnectTimerRef.current);
        disconnectTimerRef.current = null;
      }
      const peerToDestroy = peerRef.current;
      const callToDestroy = callRef.current;
      const connToDestroy = connRef.current;

      // Jeda 400ms untuk meredam remount otomatis React StrictMode di development
      setTimeout(() => {
        if (isDestroyedRef.current) {
          try {
            if (connToDestroy && connToDestroy.open) {
              connToDestroy.send({ type: "PEER_LEAVE" });
            }
          } catch {}
          try {
            callToDestroy?.close();
          } catch {}
          try {
            connToDestroy?.close();
          } catch {}
          try {
            peerToDestroy?.destroy();
          } catch {}
          if (peerRef.current === peerToDestroy) {
            peerRef.current = null;
            callRef.current = null;
            connRef.current = null;
          }
          resetPeerState();
        }
      }, 400);
    };
  }, [roomId, setRole, setPeerConnectionStatus, setIsRoomFull, setActiveGuestId, setIsPeerJoined, setRemoteStream, resetPeerState]);

  // Aksi keluar ruangan secara proaktif
  const leaveRoom = useCallback(() => {
    if (disconnectTimerRef.current) {
      clearTimeout(disconnectTimerRef.current);
      disconnectTimerRef.current = null;
    }
    sendData({ type: "PEER_LEAVE" });
  }, [sendData]);

  // Aksi siaran: Host memicu mulai sesi
  const triggerRemoteStartSession = useCallback(() => {
    sendData({ type: "START_SESSION" });
  }, [sendData]);

  // Aksi siaran: Pemicu mulai hitung mundur (dapat dikirim baik oleh Host maupun Guest)
  const sendTriggerStart = useCallback(() => {
    sendData({ type: "TRIGGER_START" });
  }, [sendData]);

  // Aksi siaran: Sinkronisasi pengaturan layout & timer
  const syncSettings = useCallback(
    (newLayout, newTimer) => {
      sendData({
        type: "SYNC_SETTINGS",
        layout: newLayout,
        timerDuration: newTimer,
      });
    },
    [sendData]
  );

  // Aksi siaran: Toggle status siap foto
  const toggleReady = useCallback(() => {
    const nextReady = !isLocalReadyRef.current;
    setIsLocalReady(nextReady);
    sendData({
      type: "PEER_READY",
      isReady: nextReady,
    });
  }, [setIsLocalReady, sendData]);

  return {
    role,
    isHost: role === "host",
    isGuest: role === "guest",
    isRoomFull,
    isPeerJoined,
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
    handlePeerLeave: handlePeerDisconnect,
  };
}
