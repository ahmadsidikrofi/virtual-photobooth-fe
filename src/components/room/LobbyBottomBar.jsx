"use client";

import { Play } from "lucide-react";

export function LobbyBottomBar({
  frames = [],
  selectedFrame,
  onSelectFrame,
  onStartSession,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#E6DFD5] bg-white p-4 shadow-xs">
      {/* Minimalist Frame Selector */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <span className="text-xs font-bold text-[#757068] mr-1">Frame:</span>
        {frames.map((frame) => (
          <button
            key={frame.id}
            onClick={() => onSelectFrame(frame.id)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${selectedFrame === frame.id
                ? "bg-[#1F1A16] text-white"
                : "bg-[#F5F0E8] text-[#757068] hover:text-ink"
              }`}
          >
            {frame.name}
          </button>
        ))}
      </div>

      {/* Start Button */}
      <button
        onClick={onStartSession}
        className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#F5A623] hover:bg-[#D98A12] px-6 py-2.5 text-sm font-extrabold text-[#1F1A16] transition-transform active:scale-95 shadow-sm cursor-pointer"
      >
        <Play className="size-3.5 fill-[#1F1A16]" />
        <span>Mulai Sesi Foto</span>
      </button>
    </div>
  );
}
