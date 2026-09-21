"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Camera,
  Mic,
  FlipHorizontal,
  SwitchCamera,
  SlidersHorizontal,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";

/**
 * DeviceSettingsModal
 * Komponen modal terpisah untuk memilih perangkat Kamera (webcam eksternal/internal),
 * Mikrofon, serta kontrol Cermin (Mirror) dan Balik Kamera (Front/Back Camera Flip).
 * Mengikuti sistem desain Snapmate (DESIGN.md): Warm Cream, Fun-Yellow, Zero AI Slop.
 */
export function DeviceSettingsModal({
  isOpen,
  onOpenChange,
  videoDevices = [],
  audioDevices = [],
  selectedVideoDeviceId = "",
  selectedAudioDeviceId = "",
  onSelectVideoDevice,
  onSelectAudioDevice,
  isMirrored = true,
  onToggleMirror,
  onQuickFlipCamera,
  facingMode = "user",
  isSwitchingDevice = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="max-w-[92vw] sm:max-w-md rounded-3xl bg-[#FAF9F5] border-2 border-[#E6DFD5] p-5 sm:p-6 shadow-[0_24px_64px_rgba(31,26,22,0.18)] duration-200"
      >
        <div className="flex flex-col gap-5 text-left">
          {/* Header */}
          <div className="flex items-start gap-3.5 pr-6">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-fun-yellow/20 border border-fun-yellow/40 text-[#1F1A16] shadow-2xs">
              <SlidersHorizontal className="size-5 stroke-[2.2]" />
            </div>

            <DialogHeader className="gap-1 text-left items-start">
              <DialogTitle className="text-base sm:text-lg font-black text-[#1F1A16] tracking-tight">
                Pengaturan Kamera & Audio
              </DialogTitle>
              <DialogDescription className="text-xs text-[#757068] leading-relaxed">
                Pilih perangkat webcam, mikrofon, dan orientasi cermin pratinjau foto.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Indikator Loading saat Beralih Perangkat */}
          {isSwitchingDevice && (
            <div className="flex items-center gap-2 rounded-2xl bg-fun-yellow/15 border border-fun-yellow/30 px-3.5 py-2 text-xs font-bold text-[#1F1A16] animate-in fade-in duration-150">
              <Loader2 className="size-3.5 animate-spin text-fun-yellow-dark" />
              <span>Menghubungkan ke perangkat yang dipilih...</span>
            </div>
          )}

          {/* Form Kontrol Perangkat */}
          <div className="flex flex-col gap-4">
            {/* 1. Pemilihan Kamera (Webcam) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#1F1A16]">
                  <Camera className="size-3.5 text-[#757068]" />
                  <span>Pilih Kamera</span>
                </label>
                {videoDevices.length > 1 && (
                  <span className="rounded-full bg-[#EFE9DE] border border-[#E6DFD5] px-2 py-0.5 text-[10px] font-semibold text-[#757068]">
                    {videoDevices.length} Kamera
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedVideoDeviceId}
                  disabled={isSwitchingDevice || videoDevices.length === 0}
                  onChange={(e) => onSelectVideoDevice(e.target.value)}
                  className="w-full rounded-2xl border border-[#E6DFD5] bg-white px-3.5 py-2.5 pr-10 text-xs font-semibold text-[#1F1A16] shadow-2xs focus:outline-none focus:ring-2 focus:ring-fun-yellow/70 focus:border-fun-yellow cursor-pointer disabled:opacity-60 transition-colors appearance-none"
                >
                  {videoDevices.length === 0 ? (
                    <option value="">Kamera Default</option>
                  ) : (
                    videoDevices.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Kamera ${idx + 1}`}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#757068]" />
              </div>

              {/* Toggle Cermin Kamera Saya (Mirror Video) */}
              <div className="mt-1 flex items-center justify-between rounded-2xl border border-[#E6DFD5] bg-[#F5F0E8] hover:bg-[#EFE9DE] py-1 px-2 shadow-2xs">
                <div className="flex items-center gap-2.5 pr-2">
                  <div className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-primary text-[#1F1A16]">
                    <FlipHorizontal className="size-3.5 text-white stroke-[2.2]" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#1F1A16]">
                      Cerminkan Kamera Saya
                    </h5>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onToggleMirror}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isMirrored ? "bg-fun-yellow" : "bg-[#D1C9BE]"
                    }`}
                  role="switch"
                  aria-checked={isMirrored}
                >
                  <span
                    className={`pointer-events-none inline-flex size-5 items-center justify-center transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${isMirrored ? "translate-x-5" : "translate-x-0"
                      }`}
                  >
                    {isMirrored && <Check className="size-3 text-[#1F1A16] stroke-[3]" />}
                  </span>
                </button>
              </div>

              {/* Tombol Pintas Balik Kamera (Front/Back) */}
              <button
                type="button"
                disabled={isSwitchingDevice}
                onClick={onQuickFlipCamera}
                className="mt-1 flex items-center justify-center gap-2 rounded-2xl border border-[#E6DFD5] bg-[#F5F0E8] hover:bg-[#EFE9DE] py-2 px-3 text-xs font-bold text-[#1F1A16] transition-all cursor-pointer active:scale-98 disabled:opacity-60"
              >
                <SwitchCamera className="size-3.5 text-fun-yellow-dark" />
                <span>
                  Balik Kamera (Saat ini: {facingMode === "user" ? "Depan" : "Belakang"})
                </span>
              </button>
            </div>

            {/* 2. Pemilihan Mikrofon */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#1F1A16]">
                  <Mic className="size-3.5 text-[#757068]" />
                  <span>Pilih Mikrofon</span>
                </label>
                {audioDevices.length > 1 && (
                  <span className="rounded-full bg-[#EFE9DE] border border-[#E6DFD5] px-2 py-0.5 text-[10px] font-semibold text-[#757068]">
                    {audioDevices.length} Mikrofon
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedAudioDeviceId}
                  disabled={isSwitchingDevice || audioDevices.length === 0}
                  onChange={(e) => onSelectAudioDevice(e.target.value)}
                  className="w-full rounded-2xl border border-[#E6DFD5] bg-white px-3.5 py-2.5 pr-10 text-xs font-semibold text-[#1F1A16] shadow-2xs focus:outline-none focus:ring-2 focus:ring-fun-yellow/70 focus:border-fun-yellow cursor-pointer disabled:opacity-60 transition-colors appearance-none"
                >
                  {audioDevices.length === 0 ? (
                    <option value="">Mikrofon Default</option>
                  ) : (
                    audioDevices.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Mikrofon ${idx + 1}`}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-[#757068]" />
              </div>
            </div>
          </div>

          {/* Footer Tombol Selesai */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="mt-1 w-full rounded-full bg-fun-yellow hover:bg-[#D98A12] text-[#1F1A16] font-extrabold py-3 px-6 text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95 hover:shadow-md text-center"
          >
            Selesai
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
