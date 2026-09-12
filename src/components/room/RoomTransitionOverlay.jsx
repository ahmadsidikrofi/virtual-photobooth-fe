"use client";

import { useState, useEffect } from "react";

export function RoomTransitionOverlay({ message = "Bergabung", duration = 3000 }) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("...");

  useEffect(() => {
    const step = 50;
    const increment = (step / duration) * 100;

    // Smooth progress bar interval over 3 seconds
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, step);

    // Animated dots interval (. -> .. -> ...)
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return ".";
      });
    }, 450);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, [duration]);

  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#141210]/95 backdrop-blur-md text-white select-none transition-opacity duration-300 animate-in fade-in"
    >
      <div className="flex flex-col items-center text-center px-4 max-w-sm">
        {/* Title: Google Meet style clean text with animated dots */}
        <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-white/95 mb-6 font-sans">
          {message}
          <span className="inline-block w-8 text-left">{dots}</span>
        </h2>

        {/* Line-art illustration inspired by Google Meet transition */}
        <div className="relative size-44 sm:size-48 flex items-center justify-center mb-6">
          <svg
            viewBox="0 0 200 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-white"
          >
            {/* Soft background color blobs */}
            <rect
              x="30"
              y="60"
              width="45"
              height="45"
              rx="22.5"
              fill="#E76F51"
              fillOpacity="0.4"
              className="animate-pulse"
            />
            <circle
              cx="110"
              cy="70"
              r="22"
              fill="#F5A623"
              fillOpacity="0.45"
            />

            {/* Notebook / Screen Outline */}
            <rect
              x="85"
              y="40"
              width="85"
              height="65"
              rx="8"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="#221F1C"
              transform="rotate(-5 85 40)"
            />

            {/* Inner Camera / Screen glyph */}
            <rect
              x="105"
              y="56"
              width="32"
              height="22"
              rx="4"
              stroke="white"
              strokeWidth="2"
              fill="none"
              transform="rotate(-5 105 56)"
            />
            <path
              d="M 137 63 L 148 57 L 148 73 Z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
              transform="rotate(-5 137 63)"
            />

            {/* Coffee mug / Pen Line Art */}
            <path
              d="M 50 75 C 50 95, 80 95, 80 75 Z"
              stroke="white"
              strokeWidth="2.5"
              fill="#1F1A16"
            />
            <path
              d="M 78 80 C 86 80, 86 88, 78 88"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Whimsical curved trajectory line */}
            <path
              d="M 60 40 C 90 20, 130 20, 160 30"
              stroke="white"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          </svg>
        </div>

        {/* 3-Second Smooth Progress Bar */}
        <div className="w-40 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-fun-yellow rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
