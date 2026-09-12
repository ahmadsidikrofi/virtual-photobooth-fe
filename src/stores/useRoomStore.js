"use client";

import { create } from "zustand";

export const useRoomStore = create((set) => ({
  // Studio Mode: "solo" (Studio Solo) or "duo" (Bilik Berdua)
  studioMode: "solo",
  copied: false,
  isPeerJoined: false,

  setStudioMode: (studioMode) => set({ studioMode }),
  setCopied: (copied) => set({ copied }),
  setIsPeerJoined: (isPeerJoined) => set({ isPeerJoined }),
  togglePeerJoined: () => set((state) => ({ isPeerJoined: !state.isPeerJoined })),
}));
