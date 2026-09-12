"use client";

import { FlipHorizontal } from "lucide-react";
import { GRID_CONFIGS } from "@/lib/grid-configs";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";

export function PreShootControls({
  selectedLayout: propSelectedLayout,
  onSelectLayout,
  timerDuration: propTimerDuration,
  onSelectTimer,
  isMirrored: propIsMirrored,
  onToggleMirror,
  onStartSession,
  cameraActive,
  isLoadingCamera,
}) {
  const storeLayout = usePhotoboothStore((s) => s.selectedLayout);
  const storeTimer = usePhotoboothStore((s) => s.timerDuration);
  const storeMirrored = usePhotoboothStore((s) => s.isMirrored);
  const storeSetLayout = usePhotoboothStore((s) => s.setSelectedLayout);
  const storeSetTimer = usePhotoboothStore((s) => s.setTimerDuration);
  const storeToggleMirror = usePhotoboothStore((s) => s.toggleMirror);

  const selectedLayout = propSelectedLayout ?? storeLayout;
  const timerDuration = propTimerDuration ?? storeTimer;
  const isMirrored = propIsMirrored ?? storeMirrored;
  const handleSelectLayout = onSelectLayout ?? storeSetLayout;
  const handleSelectTimer = onSelectTimer ?? storeSetTimer;
  const handleToggleMirror = onToggleMirror ?? storeToggleMirror;
  return (
    <div className="rounded-xl border border-[#E6DFD5] bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Pengaturan Format, Timer, & Mirror */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1">
        {/* 1. Format Dropdown (Dinamis dari GRID_CONFIGS) */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <label htmlFor="format-select" className="text-[11px] font-bold text-[#757068]">
            Format Photostrip
          </label>
          <div className="relative">
            <select
              id="format-select"
              value={selectedLayout}
              onChange={(e) => handleSelectLayout(e.target.value)}
              className="w-full appearance-none rounded-xl border border-[#E6DFD5] bg-[#FAF9F5] px-3.5 py-2 text-xs font-bold text-ink hover:border-[#D1C9BE] focus:outline-hidden focus:ring-2 focus:ring-fun-yellow transition-colors cursor-pointer pr-8"
            >
              {Object.values(GRID_CONFIGS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.requiredPhotos} foto)
                </option>
              ))}
            </select>
            {/* Custom subtle chevron */}
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#757068]">
              ▾
            </span>
          </div>
        </div>

        {/* 2. Timer Segmented Buttons */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-[#757068]">
            Timer
          </label>
          <div className="flex items-center rounded-xl bg-[#FAF9F5] border border-[#E6DFD5] p-0.5">
            {[3, 5, 10].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleSelectTimer(sec)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${timerDuration === sec
                  ? "bg-[#1F1A16] text-white shadow-xs"
                  : "text-[#757068] hover:text-ink"
                  }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        {/* 3. Mirror Toggle Button */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-[#757068]">
            Cermin Kamera
          </label>
          <button
            type="button"
            onClick={handleToggleMirror}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${isMirrored
              ? "bg-fun-yellow/20 border-fun-yellow text-ink font-extrabold"
              : "bg-[#FAF9F5] border-[#E6DFD5] text-[#757068] hover:text-ink"
              }`}
          >
            <FlipHorizontal className="size-3.5" />
            <span>{isMirrored ? "Aktif" : "Mati"}</span>
          </button>
        </div>
      </div>

      {/* 4. Tombol Utama CTA (Mulai Sesi Foto 8 Jepretan) */}
      <div className="w-full md:w-auto shrink-0">
        <button
          type="button"
          onClick={onStartSession}
          disabled={!cameraActive || isLoadingCamera}
          className={`w-full md:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-extrabold transition-all shadow-sm active:scale-95 ${!cameraActive || isLoadingCamera
            ? "bg-[#F5E4C4] text-[#9C968C] cursor-not-allowed opacity-60"
            : "bg-fun-yellow hover:bg-[#D98A12] text-ink cursor-pointer hover:shadow-md"
            }`}
        >
          <span>Mulai Sesi Foto (8 Jepretan)</span>
        </button>
      </div>
    </div>
  );
}
