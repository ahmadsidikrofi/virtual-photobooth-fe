"use client";

import { forwardRef } from "react";

const DEFAULT_MOCK_PHOTOS = [
  {
    src: "/images/webcam_heart_left.jpg",
    alt: "Foto Sisi Kiri - JKT",
  },
  {
    src: "/images/webcam_heart_right.jpg",
    alt: "Foto Sisi Kanan - BDG",
  },
  {
    src: "/images/webcam_tos_right.jpg",
    alt: "Momen Kebersamaan",
  },
  {
    src: "/images/webcam_tos_left.jpg",
    alt: "Senyum Bersama",
  },
];

export const DistanceThreadFrame = forwardRef(function DistanceThreadFrame(
  {
    photos = [],
    filterStyle = {},
    footerTexts = {
      title: "140 km terpisah, 0 km di hati.",
      subtitle: "07.09.2026",
      note: "JKT ➔ BDG",
    },
    codeA = "JKT",
    codeB = "BDG",
    distance = "140 km",
    date = "07.09.2026",
    quote = "140 km terpisah, 0 km di hati.",
    paperColor = "#F9F6F0",
    className = "",
  },
  ref
) {
  // Normalize photos input
  const photoList =
    photos && photos.length > 0
      ? photos.map((p, index) =>
        typeof p === "string"
          ? { src: p, alt: `Distance Thread Photo ${index + 1}` }
          : p
      )
      : DEFAULT_MOCK_PHOTOS;

  // Extract route codes from footerTexts.note if formatted like "JKT ➔ BDG"
  let displayCodeA = codeA;
  let displayCodeB = codeB;
  let displayDistance = distance;

  if (footerTexts?.note) {
    const parts = footerTexts.note.split(/➔|->|—/);
    if (parts.length >= 2) {
      displayCodeA = parts[0].trim();
      displayCodeB = parts[1].trim();
    } else {
      displayDistance = footerTexts.note.trim();
    }
  }

  const displayDate = footerTexts?.subtitle || date;
  const displayQuote = footerTexts?.title || quote;

  const isFourPhotos = photoList.length >= 4;

  return (
    <div
      ref={ref}
      style={{ backgroundColor: paperColor }}
      className={`relative w-[310px] mx-auto rounded-xl p-4 sm:p-5 shadow-md border border-[#E6DFD1] select-none ${className}`}
    >
      {/* ========================================================= */}
      {/* Transparent SVG Overlay: Dashed Red Thread & Airplane Path */}
      {/* ========================================================= */}
      <svg
        viewBox={isFourPhotos ? "0 0 300 780" : "0 0 300 640"}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible z-20"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Continuous Delicate Red Thread looping gracefully around margins */}
        <path
          d={
            isFourPhotos
              ? "M 58 26 C 110 18, 140 32, 175 25 C 220 16, 276 55, 276 130 C 276 200, 24 195, 24 275 C 24 350, 276 355, 276 435 C 276 525, 24 530, 24 610 C 24 690, 276 695, 276 740 C 276 765, 180 770, 120 772 C 80 775, 50 775, 45 775"
              : "M 58 26 C 110 18, 140 32, 175 25 C 220 16, 276 60, 276 140 C 276 215, 24 210, 24 290 C 24 380, 276 385, 276 470 C 276 560, 180 595, 120 605 C 80 612, 50 615, 45 615"
          }
          fill="none"
          stroke="#E76F51"
          strokeWidth="1.5"
          strokeDasharray="5 4"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Small Paper Airplane gliding along the top path */}
        <g transform="translate(200, 17) rotate(8) scale(0.75)">
          <path
            d="M 0 0 L 18 8 L 0 16 L 4 8 Z"
            fill="#E76F51"
            stroke="#E76F51"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <path d="M 4 8 L 18 8" stroke="#FAF9F5" strokeWidth="0.8" />
        </g>
        <g transform="translate(80, 17) rotate(8) scale(0.75)">
          <path
            d="M 0 0 L 18 8 L 0 16 L 4 8 Z"
            fill="#E76F51"
            stroke="#E76F51"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
          <path d="M 4 8 L 18 8" stroke="#FAF9F5" strokeWidth="0.8" />
        </g>

        {/* Delicate Heart Knot at the Thread Finish */}
        <circle cx="45" cy={isFourPhotos ? "775" : "615"} r="2.5" fill="#E76F51" />
      </svg>

      {/* ========================================================= */}
      {/* Top Header: Sleek & Minimalist Airmail Route              */}
      {/* ========================================================= */}
      <div className="relative z-10 mb-3.5 flex items-center justify-between border-b border-[#E8E1D2] pb-2.5">
        {/* Departure City */}
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-[#E76F51]" />
          <span className="font-mono text-xs font-extrabold tracking-wider text-ink">
            {displayCodeA}
          </span>
        </div>

        {/* Center Distance & Flight Path */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EFE9DE]/70 border border-[#E2DAC9] text-[9.5px] font-mono text-[#757068]">
          <span className="font-semibold text-ink">{displayDistance}</span>
        </div>

        {/* Arrival City */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-extrabold tracking-wider text-ink">
            {displayCodeB}
          </span>
          <span className="size-1.5 rounded-full bg-[#E76F51]" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* Photos Stack - Clean, Bordered & Uncluttered              */}
      {/* ========================================================= */}
      <div className="relative z-10 flex flex-col gap-2.5">
        {photoList.map((photo, index) => (
          <div
            key={index}
            className="group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#EAE2D2] border border-[#DDD3BF] shadow-xs"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt || `Photo ${index + 1}`}
              style={filterStyle}
              className="size-full object-cover object-center transition-transform duration-300"
              crossOrigin="anonymous"
            />
            {/* Subtle soft-light film atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3A2518]/20 via-transparent to-amber-500/5 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* ========================================================= */}
      {/* Bottom Area: Virtual Postmark Stamp & Romantic Chin       */}
      {/* ========================================================= */}
      <div className="relative z-10 mt-4 pt-2 border-t border-dashed border-[#DDD3BF] flex items-center justify-between gap-2">
        {/* Quote / Sentiment */}
        <div className="flex-1 min-w-0 pr-1">
          <p className="font-serif italic text-[11px] leading-tight text-ink/85">
            &ldquo;{displayQuote}&rdquo;
          </p>
        </div>

        {/* Virtual Postal Postmark Stamp (Rubber cancellation mark) */}
        <div className="relative shrink-0 flex items-center gap-1 rotate-[-6deg] opacity-90">
          {/* Circular Stamp */}
          <div className="size-12 rounded-full border border-dashed border-[#E76F51]/70 p-0.5 flex items-center justify-center">
            <div className="size-full rounded-full border border-[#E76F51]/60 flex flex-col items-center justify-center text-center text-[#E76F51] p-1">
              <span className="text-[6px] font-mono font-bold tracking-tighter leading-none">
                SNAPMATE
              </span>
              <span className="text-[5.5px] font-mono tracking-widest my-0.5">
                AIRMAIL
              </span>
              <span className="text-[6px] font-mono font-semibold leading-none">
                {displayDate}
              </span>
            </div>
          </div>

          {/* Postal Cancellation Waves */}
          <svg className="w-5 h-8 text-[#E76F51]/60 shrink-0" viewBox="0 0 20 32" fill="none">
            <path d="M 0 6 Q 10 2 20 6" stroke="currentColor" strokeWidth="1" />
            <path d="M 0 16 Q 10 12 20 16" stroke="currentColor" strokeWidth="1" />
            <path d="M 0 26 Q 10 22 20 26" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
});

