"use client";

import { create } from "zustand";
import { GRID_CONFIGS } from "@/lib/grid-configs";

const getTodayFormatted = () => {
  if (typeof window === "undefined") return "10.09.2026";
  try {
    return new Date()
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, ".");
  } catch {
    return "10.09.2026";
  }
};

const INITIAL_DESIGN_STATE = {
  selectedFrameId: "pure-white",
  paperColor: "#FFFFFF",
  activeFilter: "normal",
  footerTexts: {
    title: "Snapmate",
    subtitle: getTodayFormatted(),
    note: "BDG • 04:20 PM",
  },
  isExporting: false,
};

export const usePhotoboothStore = create((set, get) => ({
  // =========================================================================
  // 1. PRE-SHOOT & LAYOUT SETTINGS
  // =========================================================================
  selectedLayout: "strip_1x4",
  timerDuration: 3, // 3 | 5 | 10
  isMirrored: true,

  setSelectedLayout: (layout) => {
    set((state) => {
      const config = GRID_CONFIGS[layout] || GRID_CONFIGS.strip_1x4;
      const maxPhotos = config.requiredPhotos || 4;

      // Truncate selected indices if exceeding new layout limit
      const updatedIndices =
        state.selectedIndices.length > maxPhotos
          ? state.selectedIndices.slice(0, maxPhotos)
          : state.selectedIndices;

      // Safe fallback for frame IDs specific to 1x4 or 1x3
      let updatedFrameId = state.selectedFrameId;
      const is1x4Only = ["polaroid-chin", "airmail-post", "retro-seluloid"].includes(
        state.selectedFrameId
      );
      const is1x3Only = state.selectedFrameId === "newspaper-full";

      if (layout !== "strip_1x4" && is1x4Only) {
        updatedFrameId = "pure-white";
      } else if (layout !== "strip_1x3" && is1x3Only) {
        updatedFrameId = "pure-white";
      }

      return {
        selectedLayout: layout,
        selectedIndices: updatedIndices,
        selectedFrameId: updatedFrameId,
      };
    });
  },

  setTimerDuration: (timerDuration) => set({ timerDuration }),
  setIsMirrored: (updaterOrValue) =>
    set((state) => ({
      isMirrored:
        typeof updaterOrValue === "function"
          ? Boolean(updaterOrValue(state.isMirrored))
          : Boolean(updaterOrValue),
    })),
  toggleMirror: () => set((state) => ({ isMirrored: !state.isMirrored })),

  // =========================================================================
  // 2. ENGINE & CAPTURE SESSION
  // =========================================================================
  sessionState: "idle", // "idle" | "countdown" | "flash" | "curating" | "designing"
  countdownValue: 3,
  currentShot: 1,
  transitionText: null,
  capturedPhotos: [], // 8-shot universal buffer

  setSessionState: (sessionState) => set({ sessionState }),
  setCountdownValue: (countdownValue) => set({ countdownValue }),
  setCurrentShot: (currentShot) => set({ currentShot }),
  setTransitionText: (transitionText) => set({ transitionText }),
  setCapturedPhotos: (updaterOrValue) =>
    set((state) => ({
      capturedPhotos:
        typeof updaterOrValue === "function"
          ? updaterOrValue(state.capturedPhotos)
          : updaterOrValue,
    })),
  addCapturedPhoto: (photo) =>
    set((state) => ({ capturedPhotos: [...state.capturedPhotos, photo] })),

  // =========================================================================
  // 3. PHOTO CURATION STAGE
  // =========================================================================
  selectedIndices: [],

  setSelectedIndices: (updaterOrValue) =>
    set((state) => ({
      selectedIndices:
        typeof updaterOrValue === "function"
          ? updaterOrValue(state.selectedIndices)
          : updaterOrValue,
    })),

  toggleSelectPhoto: (index) => {
    set((state) => {
      const config =
        GRID_CONFIGS[state.selectedLayout] || GRID_CONFIGS.strip_1x4;
      const maxPhotos = config.requiredPhotos || 4;

      if (state.selectedIndices.includes(index)) {
        return {
          selectedIndices: state.selectedIndices.filter((i) => i !== index),
        };
      } else {
        if (state.selectedIndices.length < maxPhotos) {
          return {
            selectedIndices: [...state.selectedIndices, index],
          };
        }
        return {};
      }
    });
  },

  // =========================================================================
  // 4. STRIP DESIGN & EXPORT STAGE (Retained across curation navigations!)
  // =========================================================================
  ...INITIAL_DESIGN_STATE,

  setSelectedFrameId: (selectedFrameId) => set({ selectedFrameId }),
  setPaperColor: (paperColor) => set({ paperColor }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setFooterTexts: (updater) =>
    set((state) => ({
      footerTexts:
        typeof updater === "function"
          ? updater(state.footerTexts)
          : { ...state.footerTexts, ...updater },
    })),
  setIsExporting: (isExporting) => set({ isExporting }),

  // =========================================================================
  // 5. SESSION RESETS
  // =========================================================================
  // Reset when user retakes or starts a new session (Preserves design choices!)
  resetSession: () =>
    set((state) => ({
      sessionState: "idle",
      currentShot: 1,
      countdownValue: state.timerDuration,
      capturedPhotos: [],
      selectedIndices: [],
      transitionText: null,
      isExporting: false,
    })),

  // Full reset back to initial factory state
  resetAll: () =>
    set({
      selectedLayout: "strip_1x4",
      timerDuration: 3,
      isMirrored: true,
      sessionState: "idle",
      countdownValue: 3,
      currentShot: 1,
      transitionText: null,
      capturedPhotos: [],
      selectedIndices: [],
      ...INITIAL_DESIGN_STATE,
    }),
}));
