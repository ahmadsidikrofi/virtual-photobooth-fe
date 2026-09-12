"use client";

import { useState } from "react";
import { PureWhitePolaroidFrame } from "./PureWhitePolaroidFrame";
import { RetroFilmstrip35mmFrame } from "./RetroFilmstrip35mmFrame";
import { DistanceThreadFrame } from "./DistanceThreadFrame";
import { DailyNewsNewspaperFrame } from "./DailyNewsNewspaperFrame";

export function FrameGallerySection() {
  const [selectedView, setSelectedView] = useState("all");

  const categories = [
    { id: "all", label: "Semua Frame" },
    { id: "polaroid", label: "Pure White" },
    { id: "filmstrip", label: "Retro 35mm" },
    { id: "distance", label: "Distance Thread" },
    { id: "newspaper", label: "The Daily News" },
  ];

  return (
    <section id="templates" className="relative py-16 sm:py-24 border-t border-[#E6DFD5] bg-canvas text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Koleksi Frame & Skin
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#757068] leading-relaxed">
            Pilihan bingkai fisik terpopuler dari photobooth Korea & retro analog, siap cetak 300 DPI atau simpan ke galeri ponselmu.
          </p>

          {/* Minimal Filter Tabs */}
          <div className="mt-6 inline-flex flex-wrap justify-center rounded-full border border-[#E6DFD5] bg-[#EFE9DE]/50 p-1 gap-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedView(cat.id)}
                className={`rounded-full px-3.5 sm:px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedView === cat.id
                    ? "bg-white text-ink shadow-xs"
                    : "text-[#757068] hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Showcase Display - Grid / Flex layout for 4 items */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 items-start justify-items-center">
          {/* 1. Pure White Polaroid Frame */}
          {(selectedView === "all" || selectedView === "polaroid") && (
            <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-200">
              <PureWhitePolaroidFrame className="rotate-[-1deg]" />
              <div className="text-center">
                <h4 className="text-sm font-bold text-ink">Pure White Polaroid</h4>
                <p className="text-xs text-[#757068] mt-0.5">
                  Putih bersih minimalis dengan ruang catatan di bagian dagu
                </p>
              </div>
            </div>
          )}

          {/* 2. Retro Filmstrip 35mm Frame */}
          {(selectedView === "all" || selectedView === "filmstrip") && (
            <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-200">
              <RetroFilmstrip35mmFrame className="rotate-[1deg]" />
              <div className="text-center">
                <h4 className="text-sm font-bold text-ink">Retro Filmstrip 35mm</h4>
                <p className="text-xs text-[#757068] mt-0.5">
                  Bingkai seluloid hitam dengan deretan gerigi perforasi analog
                </p>
              </div>
            </div>
          )}

          {/* 3. Distance Thread Frame */}
          {(selectedView === "all" || selectedView === "distance") && (
            <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-200">
              <DistanceThreadFrame className="rotate-[-1deg]" />
              <div className="text-center">
                <h4 className="text-sm font-bold text-ink">Distance Thread (Airmail)</h4>
                <p className="text-xs text-[#757068] mt-0.5">
                  Kertas pos krem dengan benang merah meliuk dan stempel pos virtual
                </p>
              </div>
            </div>
          )}

          {/* 4. The Daily News / Koran Inspirasi Frame */}
          {(selectedView === "all" || selectedView === "newspaper") && (
            <div className="flex flex-col items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-200">
              <DailyNewsNewspaperFrame className="rotate-[1deg]" />
              <div className="text-center">
                <h4 className="text-sm font-bold text-ink">The Daily News (Koran)</h4>
                <p className="text-xs text-[#757068] mt-0.5">
                  Layout strip koran retro dengan tajuk Breaking News & artikel editorial
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
