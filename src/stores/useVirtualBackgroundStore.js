"use client";

import { create } from "zustand";

/**
 * useVirtualBackgroundStore
 * Mengelola state preferensi virtual background photobooth secara global (Zustand v5).
 */
export const useVirtualBackgroundStore = create((set) => ({
  // Mode aktif: "none" | "blur" | "preset" | "custom"
  backgroundMode: "none",

  // ID preset terpilih dari VIRTUAL_BACKGROUND_PRESETS
  selectedPresetId: null,

  // URL gambar kustom (unggah sendiri)
  customImage: null,

  // Intensitas blur: "subtle" (8px), "medium" (14px), "strong" (24px)
  blurIntensity: "medium",

  // Status buka/tutup Drawer pemilih latar
  isSelectorOpen: false,

  // Status pemuatan model AI segmenter MediaPipe (~250KB)
  isModelLoading: false,

  // Pesan error jika gagal memuat model atau gambar
  modelError: null,

  // Actions
  setBackgroundMode: (backgroundMode) => set({ backgroundMode }),
  setSelectedPresetId: (selectedPresetId) => set({ selectedPresetId }),
  setCustomImage: (customImage) => set({ customImage }),
  setBlurIntensity: (blurIntensity) => set({ blurIntensity }),
  setIsSelectorOpen: (isSelectorOpen) => set({ isSelectorOpen }),
  setIsModelLoading: (isModelLoading) => set({ isModelLoading }),
  setModelError: (modelError) => set({ modelError }),

  resetVirtualBackground: () =>
    set({
      backgroundMode: "none",
      selectedPresetId: null,
      customImage: null,
      blurIntensity: "medium",
      isSelectorOpen: false,
      isModelLoading: false,
      modelError: null,
    }),
}));
