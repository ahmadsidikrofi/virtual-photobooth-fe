"use client";

import { forwardRef } from "react";

const DEFAULT_MOCK_PHOTOS = [
  {
    src: "/images/webcam_heart_left.jpg",
    alt: "35mm Film Frame 1 - Jakarta",
    frameNum: "21",
  },
  {
    src: "/images/webcam_heart_right.jpg",
    alt: "35mm Film Frame 2 - Bandung",
    frameNum: "22",
  },
  {
    src: "/images/webcam_tos_right.jpg",
    alt: "35mm Film Frame 3 - Together",
    frameNum: "23",
  },
  {
    src: "/images/webcam_tos_left.jpg",
    alt: "35mm Film Frame 4 - Smile",
    frameNum: "24",
  },
];

export const RetroFilmstrip35mmFrame = forwardRef(function RetroFilmstrip35mmFrame(
  {
    photos = [],
    filterStyle = {},
    footerTexts = {
      title: "SNAPMATE 400",
      subtitle: "35MM RETRO",
      note: "COLOR NEGATIVE",
    },
    paperColor = "#0F0E0D",
    className = "",
  },
  ref
) {
  // Normalize photos input: can be array of strings or array of objects
  const photoList =
    photos && photos.length > 0
      ? photos.map((p, index) =>
        typeof p === "string"
          ? {
            src: p,
            alt: `35mm Film Frame ${index + 1}`,
            frameNum: `${index + 21}`,
          }
          : {
            ...p,
            frameNum: p.frameNum || `${index + 21}`,
          }
      )
      : DEFAULT_MOCK_PHOTOS;

  // Calculate sprocket holes count proportional to photos
  const sprocketCount = Math.max(12, photoList.length * 4);
  const sprockets = Array.from({ length: sprocketCount });

  return (
    <div
      ref={ref}
      style={{ backgroundColor: paperColor }}
      className={`relative w-[310px] mx-auto rounded-lg px-2 py-4 shadow-md border border-neutral-800 select-none ${className}`}
    >
      {/* 35mm Layout: Left Sprockets, Center Photo Column, Right Sprockets */}
      <div className="relative flex items-stretch justify-between gap-2.5">
        {/* Left Sprocket Holes Column */}
        <div className="flex flex-col justify-between items-center py-2 shrink-0 w-4">
          {sprockets.map((_, i) => (
            <div
              key={`left-sprocket-${i}`}
              className="w-2.5 h-3.5 rounded-[2.5px] bg-[#FAF9F5] shadow-inner my-1 opacity-90"
            />
          ))}
        </div>

        {/* Center: Film Track & Photos */}
        <div className="flex-1 flex flex-col gap-3 py-1">
          {/* Top Film Leader Markings */}
          <div className="flex items-center justify-between text-[9px] font-mono text-amber-400/90 tracking-widest px-1">
            <span className="uppercase">{footerTexts?.title || "SNAPMATE 400"}</span>
            <span className="uppercase">{footerTexts?.note || "COLOR NEGATIVE"}</span>
          </div>

          {/* Photos Stack */}
          {photoList.map((photo, index) => (
            <div key={index} className="flex flex-col gap-1">
              {/* Individual Photo Frame */}
              <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xs bg-neutral-900 border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt || `Frame ${photo.frameNum}`}
                  style={filterStyle}
                  className="size-full object-cover object-center transition-transform duration-300"
                  crossOrigin="anonymous"
                />
                {/* Vintage analog film tint & vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-amber-950/15 pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] pointer-events-none" />
              </div>

              {/* Film Frame Counter Marking Between Frames */}
              <div className="flex items-center justify-between text-[8px] font-mono text-amber-400/80 px-1">
                <span>SAFETY FILM</span>
                <span>▶ {photo.frameNum}A</span>
              </div>
            </div>
          ))}

          {/* Bottom Film Tail Markings */}
          <div className="flex items-center justify-between text-[8px] font-mono text-amber-400/70 tracking-wider px-1 pt-1 border-t border-neutral-800">
            <span>{footerTexts?.subtitle || "DX CODE • ISO 400/27°"}</span>
            <span>35MM ANALOG</span>
          </div>
        </div>

        {/* Right Sprocket Holes Column */}
        <div className="flex flex-col justify-between items-center py-2 shrink-0 w-4">
          {sprockets.map((_, i) => (
            <div
              key={`right-sprocket-${i}`}
              className="w-2.5 h-3.5 rounded-[2.5px] bg-[#FAF9F5] shadow-inner my-1 opacity-90"
            />
          ))}
        </div>
      </div>
    </div>
  );
});

