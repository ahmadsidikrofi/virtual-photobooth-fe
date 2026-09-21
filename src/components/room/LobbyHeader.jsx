"use client";

import Link from "next/link";
import { ArrowLeft, Check, Copy } from "lucide-react";

export function LobbyHeader({
  roomId,
  copied,
  onCopy,
  onExit,
  role,
  isConnected,
}) {
  return (
    <header className="border-b border-[#E6DFD5] bg-canvas px-4 sm:px-8 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-ink hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="size-4 text-[#757068]" />
          <span className="font-extrabold tracking-tight text-base">Snapmate</span>
        </Link>

        {/* Room URL Pill with 1-Click Copy & Role */}
        <div className="flex items-center gap-2 rounded-full border border-[#E6DFD5] bg-white px-3 py-1 text-xs shadow-2xs">
          {role && (
            <span className="rounded-full bg-[#FAF9F5] border border-[#E6DFD5] px-2 py-0.5 text-[10px] font-bold text-[#757068] uppercase">
              {role === "host" ? "👑 Host" : "🤝 Guest"}
            </span>
          )}
          {/* {isConnected && (
            <span
              className="size-2 rounded-full bg-[#38A89D] animate-pulse"
              title="WebRTC P2P Terkoneksi"
            />
          )} */}
          <span className="font-mono font-bold text-ink">{roomId}</span>
          <button
            type="button"
            onClick={onCopy}
            className="flex items-center gap-1 text-[#757068] hover:text-ink transition-colors ml-1 font-medium cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Salin link</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={onExit}
          className="text-xs font-semibold text-[#757068] hover:text-ink transition-colors cursor-pointer"
        >
          Keluar
        </button>
      </div>
    </header>
  );
}
