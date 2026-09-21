"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRoomStore } from "@/stores/useRoomStore";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";

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

  // Helper sentral saat teman meninggalkan ruangan / koneksi terputus
  const handlePeerDisconnect = useCallback(() => {
    console.log("[PeerJS] Pasangan meninggalkan ruangan / terputus.");
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

  // Setup MediaCall handlers (MURNI stream remote, bukan tiruan)
  const setupMediaCall = useCallback(
    (call) => {
      callRef.current = call;

      call.on("stream", (incomingStream) => {
        // Stream asli dari browser pasangan
        setRemoteStream(incomingStream);
        setIsPeerJoined(true);
        setHasPeerDisconnected(false);
        setPeerConnectionStatus("connected");

        // Dengarkan jika track video/audio remote berakhir
        incomingStream.getTracks().forEach((track) => {
          track.onended = () => {
            console.log("[PeerJS] Remote track berakhir (onended):", track.kind);
            // Jangan putuskan ruangan jika DataConnection masih aktif terbuka
            if (connRef.current && connRef.current.open) {
              if (track.kind === "video") {
                setIsPeerCameraActive(false);
              }
              return;
            }
            const allTracksEnded = incomingStream.getTracks().every((t) => t.readyState === "ended");
            if (allTracksEnded) {
              handlePeerDisconnect();
            }
          };
        });
      });

      call.on("close", () => {
        handlePeerDisconnect();
      });

      call.on("error", (err) => {
        console.warn("[PeerJS] MediaCall error:", err);
        handlePeerDisconnect();
      });

      // Pantau RTCPeerConnection langsung untuk deteksi putus seketika
      const pc = call.peerConnection;
      if (pc) {
        pc.onconnectionstatechange = () => {
          console.log("[PeerJS] RTCPeerConnection state:", pc.connectionState);
          if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed" ||
            pc.connectionState === "closed"
          ) {
            handlePeerDisconnect();
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log("[PeerJS] ICE connectionState:", pc.iceConnectionState);
          if (
            pc.iceConnectionState === "disconnected" ||
            pc.iceConnectionState === "failed" ||
            pc.iceConnectionState === "closed"
          ) {
            handlePeerDisconnect();
          }
        };
      }
    },
    [setRemoteStream, setIsPeerJoined, setPeerConnectionStatus, handlePeerDisconnect]
  );

  // Setup DataConnection handlers
  const setupDataConnection = useCallback(
    (conn) => {
      connRef.current = conn;

      conn.on("open", () => {
        setIsPeerJoined(true);
        setHasPeerDisconnected(false);
        setPeerConnectionStatus("connected");

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
          case "GUEST_JOINED":
            setIsPeerJoined(true);
            setPeerConnectionStatus("connected");
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
        handlePeerDisconnect();
      });

      conn.on("error", (err) => {
        console.warn("[PeerJS] DataConnection error:", err);
        handlePeerDisconnect();
      });

      const pc = conn.peerConnection;
      if (pc) {
        pc.onconnectionstatechange = () => {
          if (
            pc.connectionState === "disconnected" ||
            pc.connectionState === "failed" ||
            pc.connectionState === "closed"
          ) {
            handlePeerDisconnect();
          }
        };
      }
    },
    [
      sendData,
      setIsPeerJoined,
      setPeerConnectionStatus,
      setIsPeerReady,
      setSelectedLayout,
      setTimerDuration,
      setRemoteStream,
      setIsRoomFull,
      setActiveGuestId,
      handlePeerDisconnect,
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
    const currentCall = callRef.current;
    if (currentCall && currentCall.peerConnection) {
      const videoTrack = localStream?.getVideoTracks()[0] || null;
      const audioTrack = localStream?.getAudioTracks()[0] || null;

      const pc = currentCall.peerConnection;
      if (pc.getTransceivers) {
        pc.getTransceivers().forEach((transceiver) => {
          if (transceiver.sender) {
            const kind = transceiver.receiver?.track?.kind || transceiver.sender.track?.kind;
            if (kind === "video") {
              transceiver.sender.replaceTrack(videoTrack).catch(() => {});
            } else if (kind === "audio" && audioTrack) {
              transceiver.sender.replaceTrack(audioTrack).catch(() => {});
            }
          }
        });
      } else if (pc.getSenders) {
        const senders = pc.getSenders();
        senders.forEach((sender) => {
          if (sender.track?.kind === "video" || (!sender.track && videoTrack)) {
            sender.replaceTrack(videoTrack).catch(() => {});
          } else if (sender.track?.kind === "audio") {
            if (audioTrack) sender.replaceTrack(audioTrack).catch(() => {});
          }
        });
      }
    } else if (
      roleRef.current === "guest" &&
      peerRef.current &&
      !peerRef.current.destroyed &&
      hostIdRef.current &&
      !callRef.current &&
      localStream
    ) {
      // Guest memanggil Host begitu localStream tersedia
      try {
        const call = peerRef.current.call(hostIdRef.current, localStream);
        if (call) setupMediaCallRef.current(call);
      } catch (err) {
        console.warn("[PeerJS] Gagal memanggil host:", err);
      }
    }
  }, [localStream]);

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

        // LANGKAH 1: Mendaftar sebagai Host dengan ID deterministik
        localPeer = new Peer(targetHostId, {
          debug: 1,
        });
        peerRef.current = localPeer;

        localPeer.on("open", () => {
          if (isDestroyedRef.current) return;
          setRole("host");
          setPeerConnectionStatus("connected");
          activeGuestIdRef.current = null;
          setActiveGuestId(null);
          // Murni null saat belum ada tamu
          setRemoteStream(null);
          setIsPeerJoined(false);
        });

        // SPESIFIKASI: Host mendengarkan koneksi data masuk dengan batas maksimal 2 orang
        localPeer.on("connection", (conn) => {
          if (isDestroyedRef.current) return;

          // Tolak koneksi dari diri sendiri
          if (conn.peer === localPeer.id || (peerRef.current && conn.peer === peerRef.current.id)) {
            console.warn("[PeerJS] Mengabaikan koneksi ke diri sendiri:", conn.peer);
            try {
              conn.close();
            } catch {}
            return;
          }

          // Cek: Jika activeGuestId sudah terisi dan ID yang masuk berbeda -> TOLAK (ROOM_FULL)
          if (activeGuestIdRef.current && activeGuestIdRef.current !== conn.peer) {
            console.warn(
              `[PeerJS] Ruangan penuh. Menolak tamu baru (${conn.peer}). Tamu aktif: ${activeGuestIdRef.current}`
            );

            const rejectAndDisconnect = () => {
              try {
                conn.send({ type: "ROOM_FULL" });
              } catch {}
              setTimeout(() => {
                try {
                  conn.close();
                } catch {}
              }, 500);
            };

            if (conn.open) {
              rejectAndDisconnect();
            } else {
              conn.on("open", rejectAndDisconnect);
            }
            return;
          }

          // Jika activeGuestId masih kosong: Simpan ID tamu ini
          activeGuestIdRef.current = conn.peer;
          setActiveGuestId(conn.peer);
          setupDataConnectionRef.current(conn);
        });

        // Host mendengarkan panggilan video masuk
        localPeer.on("call", (incomingCall) => {
          if (isDestroyedRef.current) return;

          // Tolak panggilan dari diri sendiri
          if (
            incomingCall.peer === localPeer.id ||
            (peerRef.current && incomingCall.peer === peerRef.current.id)
          ) {
            console.warn("[PeerJS] Mengabaikan panggilan dari diri sendiri:", incomingCall.peer);
            try {
              incomingCall.close();
            } catch {}
            return;
          }

          // Tolak panggilan jika bukan dari tamu aktif
          if (activeGuestIdRef.current && incomingCall.peer !== activeGuestIdRef.current) {
            console.warn("[PeerJS] Menolak stream video dari tamu tidak sah:", incomingCall.peer);
            try {
              incomingCall.close();
            } catch {}
            return;
          }

          if (!activeGuestIdRef.current) {
            activeGuestIdRef.current = incomingCall.peer;
            setActiveGuestId(incomingCall.peer);
          }

          const streamToAnswer = localStreamRef.current || undefined;
          incomingCall.answer(streamToAnswer);
          setupMediaCallRef.current(incomingCall);
        });

        // LANGKAH 2: Tangani jika ID Host sudah terpakai ("unavailable-id")
        localPeer.on("error", (err) => {
          if (isDestroyedRef.current) return;

          if (err.type === "unavailable-id") {
            try {
              localPeer.destroy();
            } catch {}

            // Jika pengguna ini adalah pembuat ruangan (Host), tunggu 800ms dan coba klaim ulang
            // (karena soket lama dari refresh / dev remount masih dilepas server cloud)
            if (isCreatorHost) {
              console.warn("[PeerJS] Host ID masih dilepas server cloud. Mencoba ulang dalam 800ms...");
              setTimeout(() => {
                if (!isDestroyedRef.current) {
                  initPeer();
                }
              }, 800);
              return;
            }

            // Jika pengguna adalah tamu yang bergabung: gunakan Peer ID acak baru (new Peer())
            const guestPeer = new Peer(undefined, { debug: 1 });
            peerRef.current = guestPeer;

            guestPeer.on("open", () => {
              if (isDestroyedRef.current) return;
              // Jika targetHostId sama dengan ID guest sendiri, jangan panggil diri sendiri
              if (targetHostId === guestPeer.id) return;

              setRole("guest");
              setPeerConnectionStatus("connecting");
              setRemoteStream(null);
              setIsPeerJoined(false);

              // Guest membuat Data Connection ke Host
              const conn = guestPeer.connect(targetHostId, {
                reliable: true,
              });
              setupDataConnectionRef.current(conn);

              // Guest memanggil (call) ke Host membawa localStream
              if (localStreamRef.current) {
                try {
                  const call = guestPeer.call(targetHostId, localStreamRef.current);
                  if (call) setupMediaCallRef.current(call);
                } catch (callErr) {
                  console.warn("[PeerJS] Guest error calling host:", callErr);
                }
              }
            });

            guestPeer.on("call", (incomingCall) => {
              if (isDestroyedRef.current) return;
              if (
                incomingCall.peer === guestPeer.id ||
                (peerRef.current && incomingCall.peer === peerRef.current.id)
              ) {
                try {
                  incomingCall.close();
                } catch {}
                return;
              }
              const streamToAnswer = localStreamRef.current || undefined;
              incomingCall.answer(streamToAnswer);
              setupMediaCallRef.current(incomingCall);
            });

            guestPeer.on("error", (guestErr) => {
              console.warn("[PeerJS] Guest peer error:", guestErr);
              setPeerConnectionStatus("failed");
            });
          } else {
            console.warn("[PeerJS] Peer general error:", err);
            setPeerConnectionStatus("failed");
          }
        });
      } catch (e) {
        console.error("[PeerJS] Gagal inisialisasi peer:", e);
        setPeerConnectionStatus("failed");
      }
    };

    initPeer();

    return () => {
      isDestroyedRef.current = true;
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
    sendData({ type: "PEER_LEAVE" });
  }, [sendData]);

  // Aksi siaran: Host memicu mulai sesi
  const triggerRemoteStartSession = useCallback(() => {
    sendData({ type: "START_SESSION" });
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
    syncSettings,
    toggleReady,
    leaveRoom,
    sendCameraState,
    handlePeerLeave: handlePeerDisconnect,
  };
}
