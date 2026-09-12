"use client";

import { forwardRef } from "react";
import { GRID_CONFIGS } from "@/lib/grid-configs";
import { PureWhitePolaroidFrame } from "@/components/frames/PureWhitePolaroidFrame";
import { RetroFilmstrip35mmFrame } from "@/components/frames/RetroFilmstrip35mmFrame";
import { DistanceThreadFrame } from "@/components/frames/DistanceThreadFrame";
import { DailyNewsNewspaperFrame } from "@/components/frames/DailyNewsNewspaperFrame";

export const PhotostripSheet = forwardRef(function PhotostripSheet(
  {
    photos = [],
    layoutId = "strip_1x4",
    selectedFrameId = "pure-white",
    paperColor = "#FFFFFF",
    activeFilter = "normal",
    footerTexts = {
      title: "Snapmate",
      subtitle: "10.09.2026",
      note: "BDG • 04:20 PM",
    },
  },
  ref
) {
  const config = GRID_CONFIGS[layoutId] || GRID_CONFIGS.strip_1x4;
  const isDarkPaper = paperColor === "#18181B";

  // Filter styling mapping
  const filterStyle = (() => {
    switch (activeFilter) {
      case "bw":
        return { filter: "grayscale(100%) contrast(105%)" };
      case "warm":
        return { filter: "sepia(25%) saturate(110%)" };
      case "fade":
        return { filter: "contrast(90%) brightness(102%)" };
      default:
        return { filter: "none" };
    }
  })();

  // =========================================================================
  // PILIHAN BINGKAI TAMBAHAN KHUSUS 1x4 (DARI FrameGallerySection)
  // =========================================================================
  if (layoutId === "strip_1x4") {
    if (selectedFrameId === "polaroid-chin") {
      return (
        <PureWhitePolaroidFrame
          ref={ref}
          photos={photos}
          filterStyle={filterStyle}
          footerTexts={footerTexts}
          paperColor={paperColor}
        />
      );
    }
    if (selectedFrameId === "airmail-post") {
      return (
        <DistanceThreadFrame
          ref={ref}
          photos={photos}
          filterStyle={filterStyle}
          footerTexts={footerTexts}
          paperColor={paperColor}
        />
      );
    }
    if (selectedFrameId === "retro-seluloid") {
      return (
        <RetroFilmstrip35mmFrame
          ref={ref}
          photos={photos}
          filterStyle={filterStyle}
          footerTexts={footerTexts}
          paperColor={paperColor}
        />
      );
    }
  }

  // =========================================================================
  // PILIHAN BINGKAI TAMBAHAN KHUSUS 1x3 (THE DAILY NEWS KORAN)
  // =========================================================================
  if (layoutId === "strip_1x3") {
    if (selectedFrameId === "newspaper-full") {
      return (
        <DailyNewsNewspaperFrame
          ref={ref}
          photos={photos}
          filterStyle={filterStyle}
          footerTexts={footerTexts}
          paperColor={paperColor}
        />
      );
    }
  }

  // =========================================================================
  // BINGKAI SHEET DINAMIS BAWAAN (Pure, Editorial, Thread, 35mm Film)
  // Tersedia untuk layout 1x4 dan seluruh layout lainnya tanpa terpotong!
  // =========================================================================


  // Dynamic width based on strip vs postcard format
  const sheetWidthClass =
    layoutId === "editorial_8cut"
      ? "w-[360px]"
      : config.type === "postcard"
        ? "w-[340px]"
        : "w-[310px]";

  // Text color based on paper darkness
  const textColor = isDarkPaper ? "text-zinc-100" : "text-zinc-900";
  const mutedTextColor = isDarkPaper ? "text-zinc-400" : "text-zinc-500";
  const hairlineColor = isDarkPaper ? "border-zinc-800" : "border-zinc-200";

  return (
    <div
      ref={ref}
      style={{ backgroundColor: paperColor }}
      className={`${sheetWidthClass} transition-colors duration-200 select-none shadow-md flex flex-col justify-between`}
    >
      {/* ========================================================================= */}
      {/* FRAME THEME A: THE DAILY NEWS (Editorial Masthead Header)                */}
      {/* ========================================================================= */}
      {selectedFrameId === "daily-news" && (
        <div className="pt-5 px-5 pb-2">
          <div className={`border-b-2 ${isDarkPaper ? "border-zinc-700" : "border-zinc-900"} pb-1 text-center`}>
            <div className="flex items-center justify-between text-[8px] font-mono uppercase tracking-wider mb-1 opacity-75">
              <span>VOL. 1 • ISSUE 04</span>
              <span>{footerTexts.subtitle || "10.09.2026"}</span>
            </div>
            <h1
              className={`font-serif tracking-tight text-lg sm:text-xl font-black uppercase ${textColor}`}
            >
              {footerTexts.title || "THE DAILY SNAP"}
            </h1>
            <div className={`border-t ${isDarkPaper ? "border-zinc-700" : "border-zinc-900"} mt-1 pt-0.5 text-[8px] italic tracking-widest ${mutedTextColor}`}>
              {footerTexts.note || "MEMORIES EDITION • ALL RIGHTS RESERVED"}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FRAME THEME D: 35MM FILMSTRIP (Top Film Code)                           */}
      {/* ========================================================================= */}
      {selectedFrameId === "filmstrip" && (
        <div className="pt-3 px-3 pb-1 flex items-center justify-between text-[8px] font-mono text-zinc-500 tracking-widest">
          <span>▶ KODAK 400</span>
          <span>SAFETY FILM</span>
          <span>• 01</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO GALLERY AREA (With layout-aware grids)                             */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 ${selectedFrameId === "filmstrip"
          ? "px-6 py-2 relative"
          : selectedFrameId === "daily-news"
            ? "px-5 py-2"
            : "p-4 sm:p-5"
          }`}
      >
        {/* Filmstrip Sprocket Holes (Perforasi film kiri & kanan) */}
        {selectedFrameId === "filmstrip" && (
          <>
            <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-around py-3 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className={`size-2 rounded-[1px] ${isDarkPaper ? "bg-zinc-800" : "bg-zinc-300"
                    }`}
                />
              ))}
            </div>
            <div className="absolute right-1.5 top-0 bottom-0 flex flex-col justify-around py-3 pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <span
                  key={i}
                  className={`size-2 rounded-[1px] ${isDarkPaper ? "bg-zinc-800" : "bg-zinc-300"
                    }`}
                />
              ))}
            </div>
          </>
        )}

        {/* 1. Layout Pattern: Editorial 8-Cut (3-2-3) */}
        {layoutId === "editorial_8cut" ? (
          <div className="flex flex-col gap-2">
            {/* Row 1: 3 Photos */}
            <div className="grid grid-cols-3 gap-1.5">
              {photos.slice(0, 3).map((url, i) => (
                <PhotoItem
                  key={i}
                  url={url}
                  filterStyle={filterStyle}
                  selectedFrameId={selectedFrameId}
                  isDarkPaper={isDarkPaper}
                />
              ))}
            </div>
            {/* Row 2: 2 Photos */}
            <div className="grid grid-cols-2 gap-1.5">
              {photos.slice(3, 5).map((url, i) => (
                <PhotoItem
                  key={i + 3}
                  url={url}
                  filterStyle={filterStyle}
                  selectedFrameId={selectedFrameId}
                  isDarkPaper={isDarkPaper}
                />
              ))}
            </div>
            {/* Row 3: 3 Photos */}
            <div className="grid grid-cols-3 gap-1.5">
              {photos.slice(5, 8).map((url, i) => (
                <PhotoItem
                  key={i + 5}
                  url={url}
                  filterStyle={filterStyle}
                  selectedFrameId={selectedFrameId}
                  isDarkPaper={isDarkPaper}
                />
              ))}
            </div>
          </div>
        ) : config.type === "postcard" ? (
          /* 2. Layout Pattern: Postcard 2-Columns (Wide 2x2 or Full 2x3) */
          <div className="grid grid-cols-2 gap-2">
            {photos.map((url, i) => (
              <PhotoItem
                key={i}
                url={url}
                filterStyle={filterStyle}
                selectedFrameId={selectedFrameId}
                isDarkPaper={isDarkPaper}
              />
            ))}
          </div>
        ) : (
          /* 3. Layout Pattern: Classic Strip 1-Column (1x2, 1x3, 1x4) */
          <div className="flex flex-col gap-2.5">
            {photos.map((url, i) => (
              <div key={i} className="relative flex flex-col items-center">
                {/* Distance Thread: subtle dashed connector between photos */}
                {selectedFrameId === "distance-thread" && i > 0 && (
                  <div className="h-2 w-px border-l border-dashed border-current/40 mb-1" />
                )}

                <PhotoItem
                  url={url}
                  filterStyle={filterStyle}
                  selectedFrameId={selectedFrameId}
                  isDarkPaper={isDarkPaper}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* FOOTER SECTION: Styled by Theme                                          */}
      {/* ========================================================================= */}
      <div
        className={`px-5 pb-5 pt-2 flex flex-col items-center justify-center text-center ${textColor}`}
      >
        {selectedFrameId === "pure-white" ? (
          /* Pure White: Minimalist Gallery Footer */
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold tracking-[0.25em]">
              {footerTexts.title || "SNAPMATE"}
            </span>
            <div className={`flex items-center gap-2 text-[8px] tracking-wider ${mutedTextColor}`}>
              <span>{footerTexts.subtitle || "10.09.2026"}</span>
              <span>•</span>
              <span>{footerTexts.note || "BDG • 04:20 PM"}</span>
            </div>
          </div>
        ) : selectedFrameId === "daily-news" ? (
          /* The Daily News: Small Bottom Signoff */
          <div className={`w-full pt-2 border-t ${hairlineColor} flex items-center justify-between text-[8px] font-serif ${mutedTextColor}`}>
            <span>PRINTED IN VIRTUAL PHOTOBOOTH</span>
            <span className="font-sans text-[7px] tracking-widest uppercase">
              {footerTexts.note || "PAGE 01"}
            </span>
          </div>
        ) : selectedFrameId === "distance-thread" ? (
          /* Distance Thread: LDR Route Marker */
          <div className="flex flex-col items-center gap-1 w-full">
            <div className="h-2 w-px border-l border-dashed border-current/40 mb-1" />
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase">
              <span>{footerTexts.title || "SNAPMATE"}</span>
            </div>
            {/* Penanda Rute Tipis */}
            <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[9px] font-mono tracking-wider">
              <span>{footerTexts.note || "JKT ➔ BDG"}</span>
            </div>
            <span className={`text-[8px] tracking-wider ${mutedTextColor}`}>
              {footerTexts.subtitle || "10.09.2026"}
            </span>
          </div>
        ) : (
          /* 35mm Filmstrip: Analog Frame Footer */
          <div className="flex items-center justify-between w-full text-[8px] font-mono text-zinc-500 tracking-widest pt-1 border-t border-zinc-800/40">
            <span>{footerTexts.title || "SNAPMATE"}</span>
            <span>{footerTexts.subtitle || "10.09.2026"}</span>
            <span>{footerTexts.note || "FRAME 04"}</span>
          </div>
        )}
      </div>
    </div>
  );
});

// Helper component for rendering each photo item with proper aspect ratio and frame
function PhotoItem({ url, filterStyle, selectedFrameId, isDarkPaper }) {
  return (
    <div
      className={`w-full aspect-[4/3] overflow-hidden bg-zinc-900 ${selectedFrameId === "daily-news"
        ? `border ${isDarkPaper ? "border-zinc-700" : "border-zinc-300"}`
        : selectedFrameId === "filmstrip"
          ? "border border-zinc-800/80 rounded-[2px]"
          : "rounded-[2px]"
        }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Foto photostrip"
        style={filterStyle}
        className="size-full object-cover"
        crossOrigin="anonymous"
      />
    </div>
  );
}
