"use client";

import { forwardRef } from "react";

const DEFAULT_MOCK_PHOTOS = [
  {
    src: "/images/webcam_tos_left.jpg",
    alt: "Polaroid Photo 1 - Jakarta",
    caption: "tos kanan!",
  },
  {
    src: "/images/webcam_tos_right.jpg",
    alt: "Polaroid Photo 2 - Bandung",
    caption: "tos kiri!",
  },
  {
    src: "/images/webcam_heart_right.jpg",
    alt: "Polaroid Photo 3 - Anya",
    caption: "half heart 🫶",
  },
  {
    src: "/images/webcam_heart_left.jpg",
    alt: "Polaroid Photo 4 - Together",
    caption: "smile!",
  },
];

export const PureWhitePolaroidFrame = forwardRef(function PureWhitePolaroidFrame(
  {
    photos = [],
    filterStyle = {},
    footerTexts = {
      title: "SNAPMATE POLAROID",
      subtitle: "07.09.2026",
      note: "Dua Layar, Sejiwa — Jakarta & Bandung",
    },
    paperColor = "#FFFFFF",
    className = "",
  },
  ref
) {
  // Normalize photos input: can be array of strings or array of objects
  const photoList =
    photos && photos.length > 0
      ? photos.map((p, index) =>
        typeof p === "string"
          ? { src: p, alt: `Polaroid Photo ${index + 1}` }
          : p
      )
      : DEFAULT_MOCK_PHOTOS;

  const isDarkPaper = paperColor === "#18181B";
  const textColor = isDarkPaper ? "text-neutral-200" : "text-neutral-700";
  const mutedColor = isDarkPaper ? "text-neutral-500" : "text-neutral-400";
  const borderColor = isDarkPaper ? "border-neutral-800" : "border-neutral-200/70";
  const innerBorder = isDarkPaper ? "border-neutral-800/80" : "border-neutral-200/50";
  const chinBorder = isDarkPaper ? "border-neutral-800" : "border-neutral-200/80";

  return (
    <div
      ref={ref}
      style={{ backgroundColor: paperColor }}
      className={`relative w-[310px] mx-auto rounded-xl p-4 sm:p-5 shadow-md border ${borderColor} select-none ${className}`}
    >
      {/* Top Header - Minimalist & Clean */}
      <div className={`mb-3 flex items-center justify-between text-[10px] font-mono ${mutedColor} tracking-wider`}>
        <span className="uppercase">{footerTexts?.title || "SNAPMATE POLAROID"}</span>
        <span>{footerTexts?.subtitle || "07.09.2026"}</span>
      </div>

      {/* Vertical Photo Grid (Strip 1x4 or custom) */}
      <div className="flex flex-col gap-2.5">
        {photoList.map((photo, index) => (
          <div
            key={index}
            className={`group relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-100 border ${innerBorder} shadow-inner`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.alt || `Photo ${index + 1}`}
              style={filterStyle}
              className="size-full object-cover object-center transition-transform duration-300"
              crossOrigin="anonymous"
            />
            {/* Subtle photographic vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Classic Polaroid "Chin" (Wider Bottom Area for Note / Stamp) */}
      <div className={`mt-4 pt-3 border-t border-dashed ${chinBorder} flex flex-col items-center text-center`}>
        <span className={`font-serif italic text-xs ${textColor} tracking-wide`}>
          &ldquo;{footerTexts?.note || "Dua Layar, Sejiwa — Jakarta & Bandung"}&rdquo;
        </span>
        <div className={`mt-2 flex items-center gap-2 text-[9px] font-mono ${mutedColor}`}>
          <span>ORIGINAL 2×6&rdquo; DYE-SUB</span>
          <span>•</span>
          <span>300 DPI</span>
        </div>
      </div>
    </div>
  );
});

