"use client";

import { useRef, useEffect, useState } from "react";
import { MessageCircle, Copy, Check, Hourglass, CameraOff, WifiOff } from "lucide-react";
import { useRoomStore } from "@/stores/useRoomStore";

export function PeerVideoStage({
  videoRef: propVideoRef,
  remoteVideoRef,
  remoteStream,
  isPeerReady,
  isPeerCameraActive = true,
  hasPeerDisconnected: propHasPeerDisconnected,
  role,
  roomId,
  roomUrl: propRoomUrl,
  onPeerLeave,
}) {
  const internalVideoRef = useRef(null);
  const videoRef = remoteVideoRef || propVideoRef || internalVideoRef;
  const [toastMessage, setToastMessage] = useState(null);

  const storeHasPeerDisconnected = useRoomStore((s) => s.hasPeerDisconnected);
  const hasPeerDisconnected = propHasPeerDisconnected ?? storeHasPeerDisconnected;

  const roomUrl =
    propRoomUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/room/${roomId}`
      : `http://localhost:3000/room/${roomId}`);

  // Pantau jika seluruh track remoteStream benar-benar berakhir (misal teman keluar/menutup tab)
  useEffect(() => {
    if (!remoteStream) {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    const checkTrackEnded = () => {
      const tracks = remoteStream.getTracks();
      const allEnded = tracks.length > 0 && tracks.every((t) => t.readyState === "ended");
      // Hanya pemicu leave jika SEMUA track (termasuk audio) sudah ended (artinya teman benar-benar keluar)
      if (allEnded) {
        if (onPeerLeave) {
          onPeerLeave();
        } else {
          useRoomStore.getState().setRemoteStream(null);
          useRoomStore.getState().setIsPeerJoined(false);
          useRoomStore.getState().setIsPeerReady(false);
          useRoomStore.getState().setHasPeerDisconnected(true);
          if (role === "host") {
            useRoomStore.getState().setActiveGuestId(null);
          }
        }
      }
    };

    const tracks = remoteStream.getTracks();
    tracks.forEach((track) => {
      track.addEventListener("ended", checkTrackEnded);
    });

    return () => {
      tracks.forEach((track) => {
        track.removeEventListener("ended", checkTrackEnded);
      });
    };
  }, [remoteStream, role, onPeerLeave, videoRef]);

  // Pasang stream video remote nyata ke elemen <video>
  useEffect(() => {
    if (videoRef.current) {
      if (remoteStream) {
        if (videoRef.current.srcObject !== remoteStream) {
          videoRef.current.srcObject = remoteStream;
        }
        if (isPeerCameraActive) {
          videoRef.current.play().catch((err) => {
            console.warn("Autoplay remote video terhambat user interaction:", err);
          });
        }
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [remoteStream, isPeerCameraActive, videoRef]);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(roomUrl);
      setToastMessage("Tautan ruangan berhasil disalin");
      setTimeout(() => {
        setToastMessage(null);
      }, 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Yuk masuk ke bilik foto Snapmate bareng aku! Klik tautan ini:\n${roomUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  // KONDISI 1: Belum ada tamu nyata atau teman telah terdiskoneksi / meninggalkan ruangan
  if (!remoteStream) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#FAF9F5] border-2 border-dashed border-[#E6DFD5] flex flex-col items-center justify-center text-ink p-5 sm:p-6 text-center shadow-xs">
        {/* Label Kiri Atas: Penanda Bilik Pasangan */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-10">
          <div className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/90 border border-white/10">
            {role === "guest" ? "Host" : "Guest"}
          </div>
        </div>

        {/* Floating Toast Notification saat link disalin */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full bg-[#1F1A16] px-4 py-2 text-xs font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-3 duration-200">
            <Check className="size-3.5 text-emerald-400 stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {hasPeerDisconnected ? (
          // Status A: Pasangan Terdiskoneksi / Keluar dari Ruangan (Minimalis & Jelas)
          <div className="flex flex-col items-center gap-2.5 max-w-xs w-full animate-in fade-in duration-200">
            <div className="flex size-13 items-center justify-center rounded-2xl bg-[#E76F51]/15 text-[#E76F51] border border-[#E76F51]/30 shadow-xs mb-1">
              <WifiOff className="size-6 stroke-[2.2]" />
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-black text-[#1F1A16] tracking-tight">
                {role === "guest" ? "Host Kehilangan Koneksi" : "Guest Kehilangan Koneksi"}
              </h4>
              <p className="mt-1 text-xs text-[#757068] leading-relaxed">
                Koneksi terputus. Sesi foto dihentikan dan harus dimulai dari awal.
              </p>
            </div>

            {/* Tombol Aksi Bagikan Tautan Ulang */}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-full bg-[#1F1A16] hover:bg-[#3D3A35] text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Copy className="size-3.5" />
                <span>Salin Tautan</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <MessageCircle className="size-3.5 fill-white" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ) : (
          // Status B: Awal Menunggu Pasangan Bergabung Pertama Kali
          <div className="flex flex-col items-center gap-3 max-w-sm w-full">
            <div className="flex size-13 items-center justify-center rounded-full bg-[#F5F0E8] border border-[#E6DFD5] shadow-xs">
              <Hourglass className="size-6 text-[#757068]" />
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-bold text-ink">
                Menunggu Teman/Pasangan Bergabung...
              </h4>
              <p className="mt-1 text-xs text-[#757068] leading-relaxed">
                Bilik ini khusus berdua. Bagikan tautan ruangan di bawah agar temanmu bisa langsung masuk dan foto bareng secara real-time.
              </p>
            </div>

            {/* Tombol Aksi Bagikan */}
            <div className="mt-1 flex flex-col sm:flex-row items-center gap-2 w-full">
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#1F1A16] hover:bg-[#3D3A35] text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Copy className="size-3.5" />
                <span>Salin Tautan Ruangan</span>
              </button>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <MessageCircle className="size-3.5 fill-white" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // KONDISI 2: Tamu Nyata Terhubung di Ruangan (Stream Aktif)
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#1A1917] border-2 border-[#E6DFD5] flex items-center justify-center text-ink shadow-sm">
      {/* Label Kiri Atas: Penanda Bilik Pasangan */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-10">
        <div className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/90 border border-white/10">
          {role === "guest" ? "Host" : "Guest"}
        </div>
      </div>

      {/* Video Element (Tampil live hanya saat kamera teman aktif) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`size-full object-cover transition-opacity duration-300 ${isPeerCameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Tampilan Google Meet style saat kamera teman dimatikan */}
      {!isPeerCameraActive && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#1A1917] p-6 text-center text-white animate-in fade-in duration-200">
          <div className="flex size-16 sm:size-20 items-center justify-center rounded-full bg-[#2A2723] border border-white/10 shadow-md">
            <CameraOff className="size-8 sm:size-9 text-[#D1C9BE]" />
          </div>
          <h4 className="mt-4 text-sm sm:text-base font-bold text-[#FAF9F5]">
            Kamera Teman Dimatikan
          </h4>
          <p className="mt-1.5 text-xs text-[#9C968C] max-w-xs leading-relaxed">
            Temanmu sedang menonaktifkan kamera sementara. Suara mikrofon tetap terhubung.
          </p>
        </div>
      )}
    </div>
  );
}
