"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Camera, Mic, Lock, Loader2 } from "lucide-react";

/**
 * MediaPermissionDialog
 * Dialog minimalis & bersih untuk mengaktifkan Kamera / Mikrofon.
 * Mengikuti prinsip Snapmate (DESIGN.md): Warm Cream, Fun-Yellow, Zero AI Slop.
 */
export function MediaPermissionDialog({
  isOpen,
  onOpenChange,
  mode = "camera", // "camera" | "mic" | "both"
  onRetry,
}) {
  const [loadingAction, setLoadingAction] = useState(null); // "camera" | "mic" | "both" | null
  const [errorMessage, setErrorMessage] = useState(null);

  const isCamera = mode === "camera";
  const isMic = mode === "mic";
  const isBoth = mode === "both";

  const handleAction = async (targetMode) => {
    setLoadingAction(targetMode);
    setErrorMessage(null);
    try {
      if (onRetry) {
        const success = await onRetry(targetMode);
        if (!success) {
          setErrorMessage(
            "Akses masih diblokir peramban. Ubah opsi ke 'Izinkan' lewat ikon 🔒 di bilah alamat, lalu klik tombol lagi."
          );
        }
      }
    } catch {
      setErrorMessage(
        "Gagal menyambungkan perangkat. Periksa izin di setelan browser Anda."
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const title = isCamera
    ? "Apakah kamu ingin orang lain melihatmu?"
    : isMic
      ? "Apakah kamu ingin bersuara saat foto bareng?"
      : "Mau gunakan mikrofon dan kamera sekarang?";

  const description = isCamera
    ? "Nyalakan kamera agar kamu dan temanmu bisa saling melihat di bilik foto. Kamu tetap dapat mematikannya kapan saja."
    : isMic
      ? "Nyalakan mikrofon agar kamu dan temanmu bisa saling mengobrol santai. Kamu tetap dapat mematikannya kapan saja."
      : "Nyalakan kamera dan mikrofon untuk sesi foto bersama yang lebih seru. Kamu tetap dapat mematikannya kapan saja.";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="max-w-[92vw] sm:max-w-md rounded-3xl bg-[#FAF9F5] border-2 border-[#E6DFD5] p-6 sm:p-7 shadow-[0_24px_64px_rgba(31,26,22,0.18)] data-open:slide-in-from-top-8 data-closed:slide-out-to-top-8 data-open:zoom-in-100 data-closed:zoom-out-100 duration-300"
      >
        <div className="flex flex-col items-center text-center gap-5">
          {/* Badge Ikon Kamera & Mic - Clean & Tactile */}
          <div className="flex items-center -space-x-3 pt-2">
            <div
              className={`flex size-14 sm:size-16 items-center justify-center rounded-xl border-2 transition-transform shadow-xs ${isCamera || isBoth
                ? "bg-[#F5A623] border-[#1F1A16] text-[#1F1A16] z-10 scale-105"
                : "bg-[#EFE9DE] border-[#E6DFD5] text-[#757068]"
                }`}
            >
              <Camera className="size-7 stroke-[2.2]" />
            </div>

            <div
              className={`flex size-14 sm:size-16 items-center justify-center rounded-xl border-2 transition-transform shadow-xs ${isMic || isBoth
                ? "bg-[#E76F51] border-[#1F1A16] text-white z-10 scale-105"
                : "bg-[#EFE9DE] border-[#E6DFD5] text-[#757068]"
                }`}
            >
              <Mic className="size-7 stroke-[2.2]" />
            </div>
          </div>

          {/* Heading & Subtitle Bersih */}
          <DialogHeader className="items-center text-center gap-1.5 px-2">
            <DialogTitle className="text-lg sm:text-xl font-extrabold text-[#1F1A16] tracking-tight">
              {title}
            </DialogTitle>
          </DialogHeader>

          {/* Pesan Error / Hint Ringkas jika Diblokir Browser */}
          {errorMessage && (
            <div className="w-full rounded-xl bg-amber-50/90 border border-amber-200/80 p-3 text-xs text-amber-900 flex items-start gap-2.5 text-left animate-in fade-in duration-200">
              <Lock className="size-4 text-amber-700 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* Tombol Aksi Langsung (Clean, Actionable & Simple) */}
          <div className="flex flex-col gap-2.5 w-full pt-1">
            {/* Tombol Utama */}
            {isCamera && (
              <button
                onClick={() => handleAction("camera")}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#F5A623] hover:bg-[#D98A12] py-3 text-sm font-extrabold text-[#1F1A16] shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {loadingAction === "camera" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4 stroke-[2.5]" />
                )}
                <span>Gunakan kamera</span>
              </button>
            )}

            {isMic && (
              <button
                onClick={() => handleAction("mic")}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#F5A623] hover:bg-[#D98A12] py-3 text-sm font-extrabold text-[#1F1A16] shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {loadingAction === "mic" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Mic className="size-4 stroke-[2.5]" />
                )}
                <span>Gunakan mikrofon</span>
              </button>
            )}

            {isBoth && (
              <button
                onClick={() => handleAction("both")}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#F5A623] hover:bg-[#D98A12] py-3 text-sm font-extrabold text-[#1F1A16] shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {loadingAction === "both" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Camera className="size-4 stroke-[2.5]" />
                    <Mic className="size-4 stroke-[2.5]" />
                  </div>
                )}
                <span>Gunakan mikrofon dan kamera</span>
              </button>
            )}

            {/* Tombol Gabungan (Sekunder) */}
            {!isBoth && (
              <button
                onClick={() => handleAction("both")}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-[#1F1A16] bg-white hover:bg-[#FAF9F5] py-2.5 text-xs sm:text-sm font-bold text-[#1F1A16] transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
              >
                {loadingAction === "both" ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <div className="flex items-center gap-1">
                    <Camera className="size-3.5" />
                    <span>+</span>
                    <Mic className="size-3.5" />
                  </div>
                )}
                <span>Gunakan mikrofon dan kamera</span>
              </button>
            )}

            {/* Tombol Lewati */}
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-1 text-xs font-semibold text-[#757068] hover:text-[#1F1A16] transition-colors cursor-pointer"
            >
              Nanti saja
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
