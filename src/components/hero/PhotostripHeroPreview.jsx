"use client";

import Image from "next/image";
import { Heart, Sparkles, Hand, Camera } from "lucide-react";

export function PhotostripHeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[390px] lg:max-w-[430px] select-none">
      {/* Decorative Warm Ambient Glow Behind the Strip */}
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-[#F5A623]/20 via-[#E76F51]/15 to-[#38A89D]/15 blur-3xl -z-10" />

      {/* Floating AI Co-Op Shutter Tag (Top Right) */}
      <div className="absolute -top-3 -right-2 sm:-right-4 z-30 flex items-center gap-1.5 rounded-full bg-[#F5A623] px-3 py-1 text-[11px] font-extrabold text-[#1F1A16] shadow-[0_6px_20px_rgba(245,166,35,0.35)]">
        <Camera className="size-3.5 text-[#1F1A16]" />
        <span>Auto-Shutter</span>
      </div>

      {/* Physical Photostrip Container (Clean White Photo Paper with Cream Border & Soft Shadow) */}
      <div className="relative rounded-[26px] border border-neutral-200/60 bg-white p-3.5 sm:p-4 shadow-2xl shadow-stone-200/60 ring-1 ring-black/[0.04] transition-transform duration-300 hover:rotate-0 rotate-[1.5deg]">
        {/* Minimalist Strip Header */}
        <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-[#E76F51]" />
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-neutral-400">
              DUOCUT COLLAB • 07.09.2026 • JKT - BDG
            </span>
          </div>
          <span className="font-mono text-[9px] font-bold text-neutral-300">#0142</span>
        </div>

        {/* The 2 Photostrip Frames */}
        <div className="flex flex-col gap-3">
          {/* ========================================================= */}
          {/* FRAME 1: Cross-Frame Interaction (High Five / Tos)        */}
          {/* ========================================================= */}
          <div className="group relative overflow-hidden rounded-xl border border-neutral-200/70 aspect-[16/9] shadow-inner bg-neutral-900">
            {/* Split Screen 2 Cameras with Dashed Seam */}
            <div className="grid h-full grid-cols-2 divide-x-2 divide-dashed divide-white/80">
              {/* Left Camera: Jakarta (Kamu) */}
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src="/images/webcam_tos_left.jpg"
                  alt="Webcam Jakarta - High Five"
                  fill
                  sizes="(max-width: 768px) 50vw, 220px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />
                <span className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-xs">
                  <span className="size-1.5 rounded-full bg-[#38A89D]" />
                  Jakarta (Kamu)
                </span>
              </div>

              {/* Right Camera: Bandung (Anya) */}
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src="/images/webcam_tos_right.jpg"
                  alt="Webcam Bandung - High Five"
                  fill
                  sizes="(max-width: 768px) 50vw, 220px"
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-xs">
                  <span className="size-1.5 rounded-full bg-[#38A89D]" />
                  Bandung (Anya)
                </span>
              </div>
            </div>

            {/* Cross-Frame Interaction Badge in Seam */}
            <div className="absolute inset-x-0 bottom-2.5 flex justify-center pointer-events-none">
              <span className="flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1 text-[10px] font-extrabold text-white shadow-lg backdrop-blur-sm border border-white/20">
                <Hand className="size-3 text-[#F5A623]" />
                <span>Cross-Frame Tos ✋🤚</span>
              </span>
            </div>

            {/* Sticker SVG 1: Y2K Cute Sparkle on Top-Right Corner */}
            <div className="absolute top-2.5 right-24 pointer-events-none rotate-12 drop-shadow-md">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z"
                  fill="#F5A623"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* Sticker SVG 2: Korean Ribbon Bow on Anya's Side */}
            <div className="absolute top-8 right-3 pointer-events-none -rotate-6 drop-shadow-md">
              <svg width="26" height="20" viewBox="0 0 32 24" fill="none">
                <path
                  d="M16 11C13 6 4 5 5 12C6 19 14 15 16 13M16 11C19 6 28 5 27 12C26 19 18 15 16 13M16 11V20M14 20L16 16L18 20"
                  stroke="#E76F51"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="#FFD2C8"
                />
                <circle cx="16" cy="12" r="2.5" fill="#E76F51" />
              </svg>
            </div>
          </div>

          {/* ========================================================= */}
          {/* FRAME 2: AI Pose Match (Half-Heart + Half-Heart)          */}
          {/* ========================================================= */}
          <div className="group relative overflow-hidden rounded-xl border border-neutral-200/70 aspect-[16/9] shadow-inner bg-neutral-900">
            {/* Split Screen 2 Cameras with Dashed Seam */}
            <div className="grid h-full grid-cols-2 divide-x-2 divide-dashed divide-[#E76F51]/80">
              {/* Left Camera: Jakarta Half Heart */}
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src="/images/webcam_heart_left.jpg"
                  alt="Webcam Jakarta - Left Heart Half"
                  fill
                  sizes="(max-width: 768px) 50vw, 220px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />
                <span className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-xs">
                  Pose Kiri 🫶
                </span>
              </div>

              {/* Right Camera: Bandung Half Heart */}
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src="/images/webcam_heart_right.jpg"
                  alt="Webcam Bandung - Right Heart Half"
                  fill
                  sizes="(max-width: 768px) 50vw, 220px"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/25 pointer-events-none" />
                <span className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/95 backdrop-blur-xs">
                  Pose Kanan 🫶
                </span>
              </div>
            </div>

            {/* Ghost Silhouette Overlay: Heart contour connecting across the seam */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <svg
                viewBox="0 0 100 100"
                className="size-20 drop-shadow-[0_0_12px_rgba(231,111,81,0.7)] animate-pulse"
                fill="none"
              >
                <path
                  d="M50 78 C25 60 14 46 14 32 C14 20 23 13 33 13 C41 13 46 17 50 22 C54 17 59 13 67 13 C77 13 86 20 86 32 C86 46 75 60 50 78 Z"
                  stroke="#E76F51"
                  strokeWidth="3.2"
                  strokeDasharray="4 3"
                  fill="rgba(231, 111, 81, 0.18)"
                />
              </svg>
            </div>

            {/* AI Co-op Matched Badge */}
            <div className="absolute inset-x-0 bottom-2.5 flex justify-center pointer-events-none z-10">
              <div className="flex items-center gap-1.5 rounded-full bg-[#E76F51] px-3.5 py-1 text-[11px] font-extrabold text-white shadow-lg shadow-[#E76F51]/40 border border-white/40">
                <Heart className="size-3.5 fill-white animate-bounce" />
                <span>98% Co-op Matched</span>
              </div>
            </div>

            {/* Handwritten Brush Doodle: "Luv ya! ♡" on bottom-left */}
            <div className="absolute bottom-2.5 left-3 pointer-events-none -rotate-3 z-10 drop-shadow-sm">
              <span className="font-serif italic font-black text-xs text-[#FAF9F5] tracking-wide bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-xs">
                &ldquo;Luv ya! ♡&rdquo;
              </span>
            </div>

            {/* Y2K Glitter Sparkle on Bandung side */}
            <div className="absolute top-3 right-4 pointer-events-none rotate-45 z-10 drop-shadow-md">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L13.8 10.2L22 12L13.8 13.8L12 22L10.2 13.8L2 12L10.2 10.2L12 2Z"
                  fill="#FFF"
                  stroke="#E76F51"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LIVE MULTIPLAYER CURSORS (Figma Style)                    */}
        {/* ========================================================= */}

        {/* Cursor 1: Kamu (Coral) - Drawing a Doodle Line */}
        <div className="absolute bottom-12 -left-4 sm:-left-6 z-40 pointer-events-none flex flex-col items-start drop-shadow-lg">
          {/* Animated/Realistic Hand-drawn trailing doodle stroke SVG */}
          <div className="absolute -top-6 left-2 pointer-events-none">
            <svg width="48" height="32" viewBox="0 0 60 40" fill="none">
              <path
                d="M4 32 C12 8, 30 6, 44 26 C50 36, 56 12, 58 10"
                stroke="#E76F51"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Custom Figma-Style Pointer Arrow */}
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path
                d="M1 1L6.5 18L9.8 11.2L16.5 9.2L1 1Z"
                fill="#E76F51"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="rounded-full bg-[#E76F51] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              Kamu
            </span>
          </div>
        </div>

        {/* Cursor 2: Anya (Teal) - Placing a Sticker */}
        <div className="absolute top-28 -right-3 sm:-right-5 z-40 pointer-events-none flex flex-col items-start drop-shadow-lg">
          <div className="flex items-center gap-1.5">
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
              <path
                d="M1 1L6.5 18L9.8 11.2L16.5 9.2L1 1Z"
                fill="#38A89D"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <span className="rounded-full bg-[#38A89D] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
              Anya
            </span>
          </div>
          <span className="ml-5 -mt-1 rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-[#206961] shadow-2xs border border-neutral-200">
            Nempelin stiker ✨
          </span>
        </div>

        {/* Strip Bottom Footer (Korean Analog Photobooth Aesthetic) */}
        <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-2 px-1 text-[10px] font-bold text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#F5A623]" />
            <span className="tracking-tight text-neutral-600 font-semibold">
              DUOCUT PHOTO STUDIO • HIGH RES READY
            </span>
          </div>
          <div className="font-mono text-neutral-800 tracking-widest text-[9px]">
            ||| | | |||| |||
          </div>
        </div>
      </div>
    </div>
  );
}
