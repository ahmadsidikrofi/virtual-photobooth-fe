"use client";

import { forwardRef } from "react";

const DEFAULT_MOCK_PHOTOS = [
  {
    src: "/images/webcam_tos_right.jpg",
    alt: "Foto Utama - Momen Bersama",
  },
  {
    src: "/images/webcam_heart_left.jpg",
    alt: "Foto Candid Kiri",
  },
  {
    src: "/images/webcam_heart_right.jpg",
    alt: "Foto Penutup - Bersama",
  },
];

export const DailyNewsNewspaperFrame = forwardRef(function DailyNewsNewspaperFrame(
  {
    photos = [],
    filterStyle = {},
    footerTexts = {
      title: "Inspirasi Harian",
      subtitle: "06 April 2027",
      note: "KISAH DUA HATI",
    },
    city = "BANDUNG",
    date = "06 April 2027",
    headline = "KISAH DUA HATI",
    subHeadline = "MELANGKAH BERSAMA MENUJU MASA DEPAN",
    paperColor = "#F6F3EB",
    className = "",
  },
  ref
) {
  // Normalize photos input for 1x3 format
  const validPhotos = (photos || []).filter(Boolean);
  const photoList =
    validPhotos.length > 0
      ? validPhotos.map((p, index) =>
          typeof p === "string"
            ? { src: p, alt: `Koran Photo ${index + 1}` }
            : p
        )
      : DEFAULT_MOCK_PHOTOS;

  const isDarkPaper = paperColor === "#18181B";
  const textColor = isDarkPaper ? "text-zinc-100" : "text-ink";
  const textMutedColor = isDarkPaper ? "text-zinc-400" : "text-ink/80";
  const borderColor = isDarkPaper ? "border-zinc-700" : "border-ink/40";
  const borderRuleColor = isDarkPaper ? "border-zinc-700" : "border-ink";

  const displayCity = city || "BANDUNG";
  const displayDate = footerTexts?.subtitle || date;
  const displayTitle =
    !footerTexts?.title || footerTexts.title === "Snapmate"
      ? "Inspirasi Harian"
      : footerTexts.title;
  const displayHeadline =
    !footerTexts?.note ||
    footerTexts.note === "BDG • 04:20 PM" ||
    footerTexts.note === "JKT ➔ BDG"
      ? headline
      : footerTexts.note;

  return (
    <div
      ref={ref}
      style={{ backgroundColor: paperColor }}
      className={`relative w-[310px] mx-auto rounded-none p-3 sm:p-3.5 shadow-md border ${
        isDarkPaper ? "border-zinc-800" : "border-[#E5DFD3]"
      } select-none ${className}`}
    >
      {/* ========================================================= */}
      {/* 1. Top Header Bar: City | NEWS | Date                     */}
      {/* ========================================================= */}
      <div
        className={`flex items-center justify-between text-[8px] sm:text-[9px] font-mono tracking-wider ${textMutedColor} border-b ${borderColor} pb-1 px-1`}
      >
        <span className="font-bold">{displayCity}</span>
        <span className="font-serif italic font-bold tracking-widest text-[10px]">
          NEWS
        </span>
        <span>{displayDate}</span>
      </div>

      {/* ========================================================= */}
      {/* 2. Masthead: Gothic / Classic Newspaper Title             */}
      {/* ========================================================= */}
      <div className="my-1.5 flex items-center justify-center gap-2 text-center">
        <span className="text-[10px] opacity-70">✦</span>
        <h3
          className={`font-serif font-black text-xl sm:text-2xl tracking-wide uppercase ${textColor} leading-none`}
        >
          {displayTitle}
        </h3>
        <span className="text-[10px] opacity-70">✦</span>
      </div>

      {/* Double Horizontal Rule Separator */}
      <div
        className={`border-t-2 border-b ${borderRuleColor} py-[0.5px] mb-2`}
      />

      {/* ========================================================= */}
      {/* 3. Breaking News Banner with Monogram Badge               */}
      {/* ========================================================= */}
      <div className="mb-2 flex items-center gap-2 px-0.5">
        {/* Monogram Badge */}
        <div
          className={`flex size-9 shrink-0 flex-col items-center justify-center rounded-full ${
            isDarkPaper ? "bg-zinc-800 border-zinc-700" : "bg-[#1F1A16] border-amber-500/40"
          } text-[#FAF9F5] border shadow-xs`}
        >
          <span className="text-[7px] font-mono tracking-widest leading-none text-amber-300">
            SNAP
          </span>
          <span className="text-[8px] font-serif font-bold leading-none">
            MATE
          </span>
        </div>

        {/* Headline & Subheadline */}
        <div className="flex-1 min-w-0">
          <span
            className={`block font-serif italic text-[10px] ${textMutedColor} leading-none`}
          >
            Breaking News—
          </span>
          <h4
            className={`font-serif font-black text-[13px] sm:text-[14px] uppercase tracking-tight ${textColor} leading-tight`}
          >
            {displayHeadline}
          </h4>
          <p
            className={`font-serif uppercase text-[7.5px] sm:text-[8px] tracking-wider opacity-75 font-semibold leading-tight line-clamp-1`}
          >
            {subHeadline}
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. Photo 1: Full Width                                    */}
      {/* ========================================================= */}
      {photoList[0] && (
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-xs ${
            isDarkPaper ? "bg-zinc-900 border-zinc-800" : "bg-[#EAE2D2] border-ink/30"
          } border shadow-xs mb-2`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoList[0].src}
            alt={photoList[0].alt || "Foto Utama"}
            style={filterStyle}
            className="size-full object-cover object-center contrast-[1.05]"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. Middle Row: Photo 2 (Left) + Editorial Column (Right)  */}
      {/* ========================================================= */}
      {photoList[1] && (
        <div className="mb-2 grid grid-cols-12 gap-3 items-stretch">
          {/* Photo 2 (Tall Portrait ~60% Width) */}
          <div
            className={`col-span-7 relative aspect-[3/4] overflow-hidden rounded-xs ${
              isDarkPaper ? "bg-zinc-900 border-zinc-800" : "bg-[#EAE2D2] border-ink/30"
            } border shadow-xs`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoList[1].src}
              alt={photoList[1].alt || "Foto Candid"}
              style={filterStyle}
              className="size-full object-cover object-center contrast-[1.05]"
              crossOrigin="anonymous"
            />
          </div>

          {/* Side Editorial Column (~40% Width) */}
          <div
            className={`col-span-5 flex flex-col justify-between border-l ${
              isDarkPaper ? "border-zinc-800" : "border-ink/30"
            } pl-2`}
          >
            {/* Dark Section Badge */}
            <div
              className={`${
                isDarkPaper ? "bg-zinc-800 text-zinc-100" : "bg-[#1F1A16] text-white"
              } px-1 py-1.5 text-center flex items-center justify-center`}
            >
              <span className="font-mono text-[7px] font-bold uppercase tracking-wider">
                EDISI SPESIAL
              </span>
            </div>

            {/* Editorial Article Body */}
            <div
              className={`mt-1 flex-1 font-serif italic text-[6.5px] sm:text-[7px] leading-[1.25] ${
                isDarkPaper ? "text-zinc-300" : "text-ink/90"
              } text-justify tracking-[-0.01em]`}
            >
              <span
                className={`float-left mr-1 mb-0.5 flex size-3.5 items-center justify-center ${
                  isDarkPaper ? "bg-zinc-800 text-zinc-100" : "bg-ink text-white"
                } font-serif text-[8px] font-bold not-italic leading-none`}
              >
                K
              </span>
              <span>
                e&shy;ber&shy;sa&shy;ma&shy;an men&shy;ja&shy;di sum&shy;ber ke&shy;ku&shy;at&shy;an
                da&shy;lam per&shy;ja&shy;lan&shy;an hi&shy;dup. Se&shy;ti&shy;ap lang&shy;kah
                te&shy;ra&shy;sa le&shy;bih ri&shy;ngan ke&shy;ti&shy;ka di&shy;ja&shy;la&shy;ni
                ber&shy;sa&shy;ma.
              </span>
            </div>

            {/* Mini Footnote */}
            <div
              className={`mt-1 border-t ${
                isDarkPaper ? "border-zinc-800 text-zinc-500" : "border-ink/20 text-ink/60"
              } pt-0.5 text-[6.5px] font-mono text-center`}
            >
              Dua Layar, Sejiwa
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. Photo 3: Full Width Bottom Photo                       */}
      {/* ========================================================= */}
      {photoList[2] && (
        <div
          className={`relative aspect-[4/3] w-full overflow-hidden rounded-xs ${
            isDarkPaper ? "bg-zinc-900 border-zinc-800" : "bg-[#EAE2D2] border-ink/30"
          } border shadow-xs mb-2`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoList[2].src}
            alt={photoList[2].alt || "Foto Bersama"}
            style={filterStyle}
            className="size-full object-cover object-center contrast-[1.05]"
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Bottom Newspaper Colophon */}
      <div
        className={`mt-2 pt-1 border-t ${
          isDarkPaper ? "border-zinc-800 text-zinc-500" : "border-ink/30 text-ink/70"
        } flex items-center justify-between text-[7px] font-mono`}
      >
        <span>SNAPMATE GAZETTE</span>
        <span>ORIGINAL PRINT • 300 DPI</span>
      </div>
    </div>
  );
});


