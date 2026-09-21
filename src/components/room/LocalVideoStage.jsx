"use client";

import { useEffect } from "react";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  SwitchCamera,
  Settings,
  Loader2,
  Lock,
} from "lucide-react";
import { PhotoboothCountdownOverlay } from "./PhotoboothCountdownOverlay";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";

export function LocalVideoStage({
  videoRef,
  stream,
  cameraActive,
  isLoadingCamera,
  cameraPermission,
  cameraError,
  isMirrored: propIsMirrored,
  micActive,
  isMicAvailable,
  micPermission,
  isSpeaking,
  onToggleMirror: propOnToggleMirror,
  onMicClick,
  onCameraClick,
  onOpenPermissionDialog,
  onStartMedia,
  onOpenSettings,
  onQuickFlipCamera,
  facingMode = "user",
  // Engine overlay props (optional with Zustand store fallback)
  sessionState: propSessionState,
  countdownValue: propCountdownValue,
  currentShot: propCurrentShot,
  transitionText: propTransitionText,
  totalShots = 8,
}) {
  const storeSessionState = usePhotoboothStore((s) => s.sessionState);
  const storeCountdownValue = usePhotoboothStore((s) => s.countdownValue);
  const storeCurrentShot = usePhotoboothStore((s) => s.currentShot);
  const storeTransitionText = usePhotoboothStore((s) => s.transitionText);
  const storeIsMirrored = usePhotoboothStore((s) => s.isMirrored);
  const storeToggleMirror = usePhotoboothStore((s) => s.toggleMirror);

  const sessionState = propSessionState ?? storeSessionState;
  const countdownValue = propCountdownValue ?? storeCountdownValue;
  const currentShot = propCurrentShot ?? storeCurrentShot;
  const transitionText = propTransitionText ?? storeTransitionText;
  const isMirrored = propIsMirrored ?? storeIsMirrored;
  const onToggleMirror = propOnToggleMirror ?? storeToggleMirror;
  // Self-healing: Guarantee stream is attached and playing whenever element is mounted
  useEffect(() => {
    if (videoRef?.current && stream && cameraActive) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => { });
    }
  }, [videoRef, stream, cameraActive]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#1F1A16] border-2 border-[#E6DFD5] shadow-sm flex items-center justify-center text-white">
      {/* Elemen Video Preview Lokal: scaleX(-1) saat isMirrored true, none saat false */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ transform: isMirrored ? "scaleX(-1)" : "none" }}
        className={`size-full object-cover transition-transform duration-300 ${cameraActive ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      />

      {/* Mesin Jepret Countdown (in top corner), Flash, and Transition Overlay */}
      <PhotoboothCountdownOverlay
        sessionState={sessionState}
        countdownValue={countdownValue}
        currentShot={currentShot}
        transitionText={transitionText}
        totalShots={totalShots}
      />

      {/* Overlay saat Kamera Mati / Sedang Loading / Error / Diblokir */}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#1F1A16] z-10">
          {isLoadingCamera ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-7 text-fun-yellow animate-spin mb-1" />
              <span className="text-xs font-semibold text-[#FAF9F5]">Menghubungkan Kamera & Mic...</span>
            </div>
          ) : cameraPermission === "denied" ? (
            <div className="flex flex-col items-center gap-2.5 max-w-xs animate-in fade-in zoom-in-95 duration-200">
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#E76F51]/20 text-[#E76F51] mb-1">
                <CameraOff className="size-5 text-[#E76F51]" />
              </div>
              <span className="text-sm font-bold text-[#FAF9F5]">Akses Kamera Diblokir</span>
              <p className="text-xs text-[#9C968C] leading-relaxed">
                Kamera dimatikan di setelan situs peramban. Buka izinnya agar bisa mulai berfoto.
              </p>
              <button
                type="button"
                onClick={onOpenPermissionDialog}
                className="mt-1.5 flex items-center gap-1.5 rounded-full bg-fun-yellow px-4 py-2 text-xs font-extrabold text-[#1F1A16] hover:bg-[#D98A12] transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                <Lock className="size-3.5" />
                <span>Buka Izin Kamera</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 max-w-xs">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/10 text-white mb-1">
                <CameraOff className="size-5 text-fun-yellow" />
              </div>
              <span className="text-sm font-bold text-[#FAF9F5]">Kamera Belum Aktif</span>
              <p className="text-xs text-[#9C968C] leading-relaxed">
                {cameraError || "Nyalakan kamera untuk melihat pratinjau sebelum berfoto."}
              </p>
              <button
                type="button"
                onClick={onStartMedia}
                className="mt-2 flex items-center gap-1.5 rounded-full bg-fun-yellow px-4 py-2 text-xs font-bold text-[#1F1A16] hover:bg-[#D98A12] transition-colors shadow-sm cursor-pointer active:scale-95"
              >
                <Camera className="size-3.5" />
                <span>Nyalakan Kamera</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Label Kiri Atas: Nama Pengguna */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none z-10">
        <div className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/90 border border-white/10">
          Kamu
        </div>
      </div>

      {/* Tombol Balik Kamera Cepat di Ponsel / Kamera Depan-Belakang */}
      {cameraActive && !(sessionState === "countdown" || sessionState === "flash" || sessionState === "transition") && onQuickFlipCamera && (
        <button
          type="button"
          onClick={onQuickFlipCamera}
          title={`Balik Kamera (${facingMode === "user" ? "Beralih ke Kamera Belakang" : "Beralih ke Kamera Depan"})`}
          className="absolute top-3 right-3 z-10 flex size-8.5 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <SwitchCamera className="size-4 stroke-[2.2]" />
        </button>
      )}

      {/* Kontrol Media Dasar (Bawah) */}
      {(() => {
        const isCapturingSession =
          sessionState === "countdown" ||
          sessionState === "flash" ||
          sessionState === "transition";

        return (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-auto z-10">
            {/* Tombol Kontrol Perangkat (Settings, Mic & Kamera) */}
              {/* Tombol Pengaturan Perangkat (Settings Gear) */}
              {onOpenSettings && (
                <button
                  type="button"
                  disabled={isCapturingSession}
                  onClick={isCapturingSession ? undefined : onOpenSettings}
                  title="Pengaturan Perangkat Kamera & Mikrofon"
                  className={`relative flex size-8 items-center justify-center rounded-full backdrop-blur-md border transition-all ${
                    isCapturingSession
                      ? "opacity-40 cursor-not-allowed bg-black/40 border-white/10 text-white/50"
                      : "bg-black/60 border-white/20 text-white hover:bg-black/80 hover:scale-105 cursor-pointer active:scale-95"
                  }`}
                >
                  <Settings className="size-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={onMicClick}
                title={
                  micPermission === "denied"
                    ? "Akses mikrofon diblokir di browser (klik untuk membuka panduan)"
                    : !isMicAvailable
                      ? "Mikrofon belum aktif (klik untuk menghubungkan)"
                      : micActive
                        ? "Matikan Mikrofon"
                        : "Nyalakan Mikrofon"
                }
                className={`relative flex size-8 items-center justify-center rounded-full backdrop-blur-md border transition-all cursor-pointer ${!micActive || !isMicAvailable || micPermission === "denied"
                    ? "bg-[#E53E3E] border-[#E53E3E] text-white"
                    : isSpeaking
                      ? "bg-black/80 border-emerald-400 text-emerald-400 ring-2 ring-emerald-400/80"
                      : "bg-black/60 border-white/20 text-white hover:bg-black/80"
                  }`}
              >
                {micActive && isMicAvailable && micPermission !== "denied" ? (
                  <Mic className="size-3.5" />
                ) : (
                  <MicOff className="size-3.5" />
                )}
              </button>

              <button
                type="button"
                disabled={isCapturingSession}
                onClick={isCapturingSession ? undefined : onCameraClick}
                title={
                  isCapturingSession
                    ? "Kamera tidak dapat dimatikan saat sesi foto sedang berlangsung"
                    : cameraPermission === "denied"
                      ? "Akses kamera diblokir di browser (klik untuk membuka panduan)"
                      : cameraActive
                        ? "Matikan Kamera"
                        : "Nyalakan Kamera"
                }
                className={`relative flex size-8 items-center justify-center rounded-full backdrop-blur-md border transition-all ${isCapturingSession
                    ? "opacity-40 cursor-not-allowed bg-black/40 border-white/10 text-white/50"
                    : cameraActive && cameraPermission !== "denied"
                      ? "bg-black/60 border-white/20 text-white hover:bg-black/80 cursor-pointer"
                      : "bg-[#E53E3E] border-[#E53E3E] text-white cursor-pointer"
                  }`}
              >
                {cameraActive && cameraPermission !== "denied" ? (
                  <Camera className="size-3.5" />
                ) : (
                  <CameraOff className="size-3.5" />
                )}
              </button>
          </div>
        );
      })()}
    </div>
  );
}
