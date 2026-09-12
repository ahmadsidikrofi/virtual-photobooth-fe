"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  Smile,
  Laugh,
  Hourglass,
} from "lucide-react";

export const activityItems = [
  {
    id: "pose-coop",
    title: "Tantangan Pose (AI Co-op)",
    description: "Satukan simbol hati di layar & pose seru serempak.",
    icon: Heart,
    tag: "AI Powered",
    href: "#pose-coop",
  },
  {
    id: "head-tilt",
    title: "Head-Tilt Vibe Check",
    description: "Kuis kilat kiri vs kanan hanya dengan memiringkan kepala.",
    icon: Smile,
    tag: "Game",
    href: "#head-tilt",
  },
  {
    id: "face-mimic",
    title: "Face Mimic (Tebak Ekspresi)",
    description: "Tebak mimik wajah konyol temanmu tanpa suara.",
    icon: Laugh,
    tag: "Seru",
    href: "#face-mimic",
  },
  {
    id: "time-capsule",
    title: "Dual-Lock Kapsul Waktu",
    description: "Kunci foto & rekaman suara, buka berdua di masa depan.",
    icon: Hourglass,
    tag: "Spesial LDR",
    href: "#time-capsule",
  },
];

export function NavLinks({ className = "", onItemClick }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* 1. Koleksi Frame */}
      <Link
        href="#templates"
        onClick={onItemClick}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium text-[#1F1A16]/85 transition-colors hover:bg-[#EFE9DE]/80 hover:text-[#1F1A16]"
      >
        <span>Koleksi Frame</span>
        <span className="rounded-full bg-[#E76F51]/10 px-2 py-0.5 text-[11px] font-semibold text-[#E76F51]">
          12+ Desain
        </span>
      </Link>

      {/* 2. Aktivitas Seru (Dropdown Popover) */}
      <div
        ref={dropdownRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-expanded={dropdownOpen}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${dropdownOpen
            ? "bg-[#EFE9DE] text-[#1F1A16]"
            : "text-[#1F1A16]/85 hover:bg-[#EFE9DE]/80 hover:text-[#1F1A16]"
            }`}
        >
          <span>Jelajah Keseruan</span>
          <ChevronDown
            className={`size-3.5 text-[#757068] transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-[#1F1A16]" : ""
              }`}
          />
        </button>

        {/* Dropdown Floating Popover */}
        {dropdownOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2.5 z-50 w-[360px] sm:w-[380px]">
            <div className="overflow-hidden rounded-xl border border-neutral-200/70 bg-white p-2 shadow-xl shadow-stone-200/60 transition-all animate-in fade-in zoom-in-95 duration-150">
              <div className="flex flex-col gap-0.5">
                {activityItems.map((act) => {
                  const Icon = act.icon;
                  return (
                    <Link
                      key={act.id}
                      href={act.href}
                      onClick={() => {
                        setDropdownOpen(false);
                        if (onItemClick) onItemClick();
                      }}
                      className="group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-[#FAF9F5]"
                    >
                      {/* Quiet, unified icon container */}
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F0E8] text-[#1F1A16] transition-colors group-hover:bg-[#F5A623]/20 group-hover:text-[#9E5F02]">
                        <Icon className="size-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-[13px] font-semibold text-[#1F1A16] group-hover:text-[#1F1A16]">
                            {act.title}
                          </h4>
                          <span className="shrink-0 rounded-md bg-[#FAF9F5] px-1.5 py-0.5 text-[10px] font-medium text-[#757068] border border-neutral-100">
                            {act.tag}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[12px] text-[#757068] leading-tight">
                          {act.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Playground Doodling */}
      <Link
        href="#playground"
        onClick={onItemClick}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium bg-[#38A89D]/10 text-[#1F1A16]/85 transition-colors hover:bg-[#EFE9DE]/80 hover:text-[#1F1A16]"
      >
        <span>Coba Live</span>
      </Link>
    </div>
  );
}
