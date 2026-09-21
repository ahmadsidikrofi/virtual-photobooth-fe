"use client";

import { create } from "zustand";

export const useRoomStore = create((set) => ({
  // Studio Mode: "solo" (Studio Solo) or "duo" (Bilik Berdua)
  studioMode: "duo",
  copied: false,
  role: null, // "host" | "guest" | null
  activeGuestId: null, // string | null (hanya di sisi host untuk membatasi 1 guest)
  isRoomFull: false, // boolean (jika guest ketiga ditolak)
  peerConnectionStatus: "disconnected", // "disconnected" | "connecting" | "connected" | "failed"
  isPeerJoined: false, // true HANYA jika tamu aktif terhubung
  isPeerReady: false,
  isLocalReady: false,
  isPeerCameraActive: true, // boolean (status kamera aktif dari pasangan)
  remoteStream: null, // MediaStream | null (Murni null jika belum ada yang bergabung nyata)
  hasPeerDisconnected: false, // boolean (true jika pasangan pernah terhubung lalu putus)

  setStudioMode: (studioMode) => set({ studioMode }),
  setCopied: (copied) => set({ copied }),
  setRole: (role) => set({ role }),
  setActiveGuestId: (activeGuestId) => set({ activeGuestId }),
  setIsRoomFull: (isRoomFull) => set({ isRoomFull }),
  setPeerConnectionStatus: (peerConnectionStatus) => set({ peerConnectionStatus }),
  setIsPeerJoined: (isPeerJoined) => set({ isPeerJoined }),
  setIsPeerReady: (isPeerReady) => set({ isPeerReady }),
  setIsLocalReady: (isLocalReady) => set({ isLocalReady }),
  setIsPeerCameraActive: (isPeerCameraActive) => set({ isPeerCameraActive }),
  toggleLocalReady: () => set((state) => ({ isLocalReady: !state.isLocalReady })),
  setRemoteStream: (remoteStream) => set({ remoteStream }),
  setHasPeerDisconnected: (hasPeerDisconnected) => set({ hasPeerDisconnected }),
  resetPeerState: () =>
    set({
      role: null,
      activeGuestId: null,
      isRoomFull: false,
      peerConnectionStatus: "disconnected",
      isPeerJoined: false,
      isPeerReady: false,
      isLocalReady: false,
      isPeerCameraActive: true,
      remoteStream: null,
      hasPeerDisconnected: false,
    }),
}));
