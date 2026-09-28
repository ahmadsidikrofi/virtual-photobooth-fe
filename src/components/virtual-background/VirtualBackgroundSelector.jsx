"use client";

import { useRef } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useVirtualBackgroundStore } from "@/stores/useVirtualBackgroundStore";
import { VIRTUAL_BACKGROUND_PRESETS } from "@/config/virtualBackgroundPresets";
import {
  Ban,
  Aperture,
  Upload,
  Check,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

const SNAP_POINTS = ["31rem", 1];

export function VirtualBackgroundSelector() {
  const isSelectorOpen = useVirtualBackgroundStore((s) => s.isSelectorOpen);
  const setIsSelectorOpen = useVirtualBackgroundStore((s) => s.setIsSelectorOpen);
  const backgroundMode = useVirtualBackgroundStore((s) => s.backgroundMode);
  const setBackgroundMode = useVirtualBackgroundStore((s) => s.setBackgroundMode);
  const selectedPresetId = useVirtualBackgroundStore((s) => s.selectedPresetId);
  const setSelectedPresetId = useVirtualBackgroundStore((s) => s.setSelectedPresetId);
  const customImage = useVirtualBackgroundStore((s) => s.customImage);
  const setCustomImage = useVirtualBackgroundStore((s) => s.setCustomImage);
  const isModelLoading = useVirtualBackgroundStore((s) => s.isModelLoading);
  const modelError = useVirtualBackgroundStore((s) => s.modelError);
  const setModelError = useVirtualBackgroundStore((s) => s.setModelError);

  const fileInputRef = useRef(null);

  const handleSelectNone = () => {
    setModelError(null);
    setBackgroundMode("none");
    setSelectedPresetId(null);
  };

  const handleSelectBlur = () => {
    setModelError(null);
    setBackgroundMode("blur");
    setSelectedPresetId(null);
  };

  const handleSelectPreset = (preset) => {
    setModelError(null);
    setBackgroundMode("preset");
    setSelectedPresetId(preset.id);
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImage(event.target.result);
          setBackgroundMode("custom");
          setSelectedPresetId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Drawer
      open={isSelectorOpen}
      onOpenChange={setIsSelectorOpen}
      snapPoints={SNAP_POINTS}
      showSwipeHandle
    >
      <DrawerContent className="bg-[#1C1A17] text-[#FAF9F5] border-t border-white/10 max-w-2xl mx-auto shadow-2xl">
        <div className="flex flex-col h-full max-h-[85vh] overflow-hidden p-4 sm:p-6">
          {/* Header */}
          <DrawerHeader className="p-0 pb-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-white/10 text-white border border-white/15">
                  <ImageIcon className="size-5 stroke-[2]" />
                </div>
                <div>
                  <DrawerTitle className="text-base sm:text-lg font-bold tracking-tight text-[#FAF9F5]">
                    Latar Studio & Blur
                  </DrawerTitle>
                  <DrawerDescription className="text-xs text-[#9C968C] mt-0.5">
                    Pilih tirai studio editorial atau efek blur bokeh untuk bilik fotomu.
                  </DrawerDescription>
                </div>
              </div>

              {/* Status Loading AI */}
              {isModelLoading && (
                <div className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs text-amber-400 animate-in fade-in">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span className="font-semibold text-[11px]">Memuat AI...</span>
                </div>
              )}
            </div>
          </DrawerHeader>

          {/* Banner Notifikasi Error AI */}
          {modelError && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-500/30 px-3 py-2 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 text-red-400" />
              <p className="flex-1 text-[11px] leading-snug">{modelError}</p>
            </div>
          )}

          {/* Area Konten Pilihan (Scrollable) */}
          <div className="flex-1 overflow-y-auto space-y-5 pr-1 pb-4">
            {/* 1. Kategori Efek Kamera Dasar */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#757068] block mb-2.5">
                Efek Kamera
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Opsi: Asli / None */}
                <button
                  type="button"
                  onClick={handleSelectNone}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left cursor-pointer active:scale-98 ${
                    backgroundMode === "none"
                      ? "bg-white/15 border-white text-white shadow-sm ring-1 ring-white/50"
                      : "bg-[#25221E] border-white/10 text-[#C4BEB4] hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/10">
                    <Ban className="size-5 text-[#9C968C]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#FAF9F5]">Kamera Asli</p>
                    <p className="text-[11px] text-[#757068] truncate">Resolusi murni penuh</p>
                  </div>
                  {backgroundMode === "none" && (
                    <div className="ml-auto flex size-5 items-center justify-center rounded-full bg-white text-black shrink-0">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  )}
                </button>

                {/* Opsi: Blur Bokeh */}
                <button
                  type="button"
                  onClick={handleSelectBlur}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left cursor-pointer active:scale-98 ${
                    backgroundMode === "blur"
                      ? "bg-white/15 border-white text-white shadow-sm ring-1 ring-white/50"
                      : "bg-[#25221E] border-white/10 text-[#C4BEB4] hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/10">
                    <Aperture className="size-5 text-amber-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#FAF9F5]">Blur Studio</p>
                    <p className="text-[11px] text-[#757068] truncate">Bokeh kedalaman alami</p>
                  </div>
                  {backgroundMode === "blur" && (
                    <div className="ml-auto flex size-5 items-center justify-center rounded-full bg-white text-black shrink-0">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Kategori Tirai & Latar Studio Editorial */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#757068] block mb-2.5">
                Tirai & Backdrop Studio
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VIRTUAL_BACKGROUND_PRESETS.map((preset) => {
                  const isSelected =
                    backgroundMode === "preset" && selectedPresetId === preset.id;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all cursor-pointer active:scale-98 ${
                        isSelected
                          ? "border-white ring-2 ring-white/60 shadow-md"
                          : "border-white/10 hover:border-white/30 bg-[#25221E]"
                      }`}
                    >
                      {/* Thumbnail Preview Aspect 16:9 */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                        {/* Fallback Color Background */}
                        <div
                          className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                          style={{
                            backgroundColor: preset.previewColor,
                            backgroundImage: `url(${preset.imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />

                        {/* Centang Badge Aktif */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-white text-black shadow-md">
                            <Check className="size-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Info Preset */}
                      <div className="p-2.5 bg-[#25221E]/90">
                        <p className="text-xs font-bold text-[#FAF9F5] truncate">
                          {preset.name}
                        </p>
                        <p className="text-[10px] text-[#757068] truncate mt-0.5">
                          {preset.category}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Latar Kustom (Unggah dari Perangkat) */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#757068] block mb-2.5">
                Latar Mandiri
              </span>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCustomUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border border-dashed py-3 px-4 text-xs font-bold transition-all cursor-pointer ${
                    backgroundMode === "custom"
                      ? "bg-white/15 border-white text-white"
                      : "bg-[#25221E] border-white/20 text-[#C4BEB4] hover:bg-white/10 hover:border-white/40"
                  }`}
                >
                  <Upload className="size-4" />
                  <span>
                    {backgroundMode === "custom"
                      ? "Ganti Gambar Unggahan"
                      : "Unggah Gambar dari Galeri"}
                  </span>
                </button>

                {backgroundMode === "custom" && customImage && (
                  <div className="relative size-11 rounded-xl overflow-hidden border border-white/30 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customImage}
                      alt="Custom preview"
                      className="size-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
