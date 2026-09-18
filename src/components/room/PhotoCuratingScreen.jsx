"use client";

import { RotateCcw, ArrowRight, Check } from "lucide-react";
import { GRID_CONFIGS } from "@/lib/grid-configs";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";

export function PhotoCuratingScreen({
  capturedPhotos: propCapturedPhotos,
  selectedIndices: propSelectedIndices,
  selectedLayout: propSelectedLayout,
  onToggleSelect: propOnToggleSelect,
  onReset: propOnReset,
  onProceed,
}) {
  const storeCapturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);
  const storeSelectedIndices = usePhotoboothStore((s) => s.selectedIndices);
  const storeSelectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const storeToggleSelect = usePhotoboothStore((s) => s.toggleSelectPhoto);
  const storeResetSession = usePhotoboothStore((s) => s.resetSession);

  const capturedPhotos =
    propCapturedPhotos && propCapturedPhotos.length > 0
      ? propCapturedPhotos
      : storeCapturedPhotos;
  const selectedIndices = propSelectedIndices ?? storeSelectedIndices;
  const selectedLayout = propSelectedLayout ?? storeSelectedLayout;
  const onToggleSelect = propOnToggleSelect ?? storeToggleSelect;
  const onReset = propOnReset ?? storeResetSession;

  const config = GRID_CONFIGS[selectedLayout] || GRID_CONFIGS.strip_1x4;
  const requiredCount = config.requiredPhotos;
  const isComplete = selectedIndices.length === requiredCount;

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      {/* 1. Curating Header: Dinamis sesuai GRID_CONFIGS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white border border-[#E6DFD5] p-4 sm:p-5 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-ink">
            Pilih {requiredCount} Pose Terbaik ({selectedIndices.length}/{requiredCount})
          </h2>
          <p className="mt-0.5 text-xs text-[#757068]">
            Klik foto sesuai urutan yang ingin kamu tampilkan di strip foto format {config.name}.
          </p>
        </div>

        <div className="rounded-xl bg-[#FAF9F5] border border-[#E6DFD5] px-3.5 py-1.5 self-start sm:self-auto">
          <span className="text-xs font-bold text-ink">
            Format: {config.name} ({requiredCount} Foto)
          </span>
        </div>
      </div>

      {/* 2. Photo Gallery Grid (6 Photos Buffer, 3 kolom rapi) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {capturedPhotos.map((photoUrl, idx) => {
          const isSelected = selectedIndices.includes(idx);
          const selectionOrder = isSelected ? selectedIndices.indexOf(idx) + 1 : null;

          return (
            <div
              key={idx}
              onClick={() => onToggleSelect(idx)}
              className={`group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#1F1A16] cursor-pointer transition-all duration-150 select-none ${isSelected
                  ? "ring-4 ring-fun-yellow shadow-sm scale-[1.01]"
                  : "border border-[#E6DFD5] hover:border-[#D1C9BE]"
                }`}
            >
              {/* Captured Photo Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={`Pose ${idx + 1}`}
                className="size-full object-cover"
              />

              {/* Shot Label Badge (Bottom-Left) */}
              <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white/90">
                Shot {idx + 1}
              </div>

              {/* Selection Badge (Top-Right) */}
              <div className="absolute top-2 right-2">
                {isSelected ? (
                  <div className="flex size-7 items-center justify-center rounded-full bg-fun-yellow text-ink font-black text-xs shadow-sm ring-2 ring-[#1F1A16] animate-in zoom-in-75 duration-100">
                    {selectionOrder}
                  </div>
                ) : (
                  <div className="flex size-6 items-center justify-center rounded-full border border-white/60 bg-black/30 text-transparent group-hover:border-white/90 transition-colors">
                    <Check className="size-3 text-white/40 group-hover:text-white" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[#E6DFD5] bg-white p-4 shadow-sm">
        {/* Tombol Ulangi Foto */}
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-[#E6DFD5] bg-[#FAF9F5] px-4 py-2 text-xs font-bold text-ink hover:bg-[#F5F0E8] transition-colors cursor-pointer"
        >
          <RotateCcw className="size-3.5 text-[#757068]" />
          <span>Ulangi Foto</span>
        </button>

        {/* Counter Info */}
        <div className="text-xs font-semibold text-[#757068] text-center">
          {isComplete ? (
            <span className="text-emerald-700 font-bold">
              {requiredCount} pose siap disusun ke {config.name}
            </span>
          ) : (
            <span>Pilih {requiredCount - selectedIndices.length} pose lagi</span>
          )}
        </div>

        {/* Tombol Lanjut ke Desain Strip */}
        <button
          type="button"
          onClick={onProceed}
          disabled={!isComplete}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-extrabold transition-all shadow-xs ${isComplete
              ? "bg-fun-yellow hover:bg-[#D98A12] text-ink cursor-pointer active:scale-95"
              : "bg-[#F5E4C4] text-[#9C968C] cursor-not-allowed opacity-60"
            }`}
        >
          <span>Lanjut ke Desain Strip</span>
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
