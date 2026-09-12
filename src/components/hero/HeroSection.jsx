"use client";

import { Sparkles, Users, Video, Heart } from "lucide-react";
import { RoomActionCard } from "./RoomActionCard";
import { PhotostripHeroPreview } from "./PhotostripHeroPreview";

export function HeroSection({ onStartClick }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Decorative Subtle Background Elements */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-fun-yellow/10 via-canvas to-transparent pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Kolom Kiri: Hook Utama & Instant Action (7 Cols) */}
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            {/* Headline Utama (Punchy & Warm) */}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-[56px] lg:leading-[1.12]">
              Abadikan Momen Berduaan,{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-ink">Walau Terpisah</span>
                <span className="absolute bottom-1 left-0 z-0 h-3.5 w-full bg-fun-yellow rounded-md" />
              </span>{" "}
              <span className="text-accent-red">Ribuan Kota.</span>
            </h1>

            {/* Subheadline Penjelas */}
            <p className="mt-5 max-w-2xl text-base text-[#757068] sm:text-lg sm:leading-relaxed">
              Platform foto bersama real-time untuk pasangan LDR, sahabat kampus, dan mutuals fandom.
              <strong className="font-semibold text-ink">AI Co-op Pose Matching</strong>, serta{" "}
              <strong className="font-semibold text-ink">Live Doodling</strong> langsung di browser tanpa instalasi aplikasi!
            </p>

            {/* Instant Action Card (Bikin / Gabung Room) */}
            <div className="mt-8 w-full flex justify-center lg:justify-start">
              <RoomActionCard onRoomCreated={onStartClick} />
            </div>

            {/* Quick Stats / Social Proof */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2 text-xs font-bold text-[#757068]">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-fun-yellow text-xs font-bold text-ink ring-2 ring-canvas">
                    💖
                  </span>
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent-red text-xs font-bold text-white ring-2 ring-canvas">
                    ✨
                  </span>
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent-teal text-xs font-bold text-white ring-2 ring-canvas">
                    ✌️
                  </span>
                </div>
                <span>12.400+ strip foto tercetak minggu ini</span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Pratinjau Photostrip Realistis & Playful (5 Cols) */}
          <div className="flex justify-center lg:col-span-5 lg:justify-end">
            <PhotostripHeroPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
