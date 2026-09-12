"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Camera,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { NavLinks, activityItems } from "./NavLinks";
import ButtonSlideAnimate from "@/components/shadcn-space/radix/button/button-slide-animate";

export function Navbar({ onStartClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActivitiesOpen, setMobileActivitiesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled
        ? "bg-[#FAF9F5]/90 border-b border-[#E6DFD5] shadow-[0_2px_12px_rgba(31,26,22,0.04)] backdrop-blur-md"
        : "bg-[#FAF9F5] border-b border-[#E6DFD5]/70"
        }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ========================================================= */}
        {/* 1. Brand Logo (Kiri) - Bersih, Ikonik, Tanpa 'AI Chrome' */}
        {/* ========================================================= */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#F5A623] text-[#1F1A16] shadow-xs transition-transform group-hover:scale-105">
            <Camera className="size-5 stroke-[2.2]" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-[#1F1A16]">
            Snap<span className="text-[#E76F51]">mate</span>
          </span>
        </Link>

        {/* ========================================================= */}
        {/* 2. Navigasi Fitur Rapi (Tengah Navbar - Desktop)          */}
        {/* ========================================================= */}
        <nav className="hidden lg:flex items-center">
          <NavLinks />
        </nav>

        {/* ========================================================= */}
        {/* 3. Aksi Cepat & Utilitas (Kanan Navbar - Desktop)         */}
        {/* ========================================================= */}
        <div className="hidden sm:flex items-center gap-2">
          <Link href="/login">
            <ButtonSlideAnimate name="Coba Gratis" />
          </Link>
        </div>

        {/* Tombol Hamburger Menu (Mobile) */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onStartClick}
            className="rounded-full bg-[#F5A623] px-3 py-1.5 text-xs font-bold text-[#1F1A16]"
          >
            Mulai
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-9 items-center justify-center rounded-lg text-[#1F1A16] hover:bg-[#EFE9DE]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* Mobile Drawer Menu                                        */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#E6DFD5] bg-[#FAF9F5] px-4 py-4 shadow-lg animate-in slide-in-from-top-1 duration-150">
          <div className="flex flex-col gap-1">
            {/* Item 1: Koleksi Frame */}
            <Link
              href="#templates"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#1F1A16] hover:bg-[#EFE9DE]"
            >
              <span>Koleksi Frame</span>
              <span className="rounded-md bg-[#E76F51]/10 px-2 py-0.5 text-[11px] font-semibold text-[#E76F51]">
                12+ Desain
              </span>
            </Link>

            {/* Item 2: Aktivitas Seru (Accordion) */}
            <div>
              <button
                type="button"
                onClick={() => setMobileActivitiesOpen(!mobileActivitiesOpen)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#1F1A16] hover:bg-[#EFE9DE]"
              >
                <span>Jelajah Keseruan</span>
                <div className="flex items-center gap-1.5">
                  <ChevronDown
                    className={`size-4 text-[#757068] transition-transform duration-200 ${mobileActivitiesOpen ? "rotate-180" : ""
                      }`}
                  />
                </div>
              </button>

              {mobileActivitiesOpen && (
                <div className="mt-1 ml-2 pl-2 border-l border-[#E6DFD5] flex flex-col gap-1">
                  {activityItems.map((act) => {
                    const Icon = act.icon;
                    return (
                      <Link
                        key={act.id}
                        href={act.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-[#EFE9DE]"
                      >
                        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-[#F5F0E8] text-[#1F1A16]">
                          <Icon className="size-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-[#1F1A16]">
                            {act.title}
                          </span>
                          <p className="line-clamp-1 text-[11px] text-[#757068]">
                            {act.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Item 3: Coba Live */}
            <Link
              href="#playground"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#1F1A16] hover:bg-[#EFE9DE]"
            >
              <span>Coba Live</span>
              <span className="rounded-md bg-[#38A89D]/10 px-2 py-0.5 text-[11px] font-semibold text-[#247069]">
                Playground
              </span>
            </Link>

            <div className="my-2 border-t border-[#E6DFD5]" />

            {/* Auth + CTA */}
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-[#1F1A16] hover:bg-[#EFE9DE]"
              >
                Masuk Akun
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
