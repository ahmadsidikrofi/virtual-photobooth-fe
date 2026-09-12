"use client";

import { Heart, MessageCircle, Copy, Check, RotateCcw } from "lucide-react";

export function PeerVideoStage({
  isPeerJoined,
  onShareWhatsApp,
  onCopyLink,
  copied,
  onToggleTestPeer,
}) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[#F5F0E8] border-2 border-dashed border-[#E6DFD5] flex items-center justify-center text-ink p-6 text-center">
      {!isPeerJoined ? (
        <div className="flex flex-col items-center gap-3 max-w-xs">
          <div className="flex size-12 items-center justify-center rounded-full bg-white shadow-xs">
            <Heart className="size-5 text-[#E76F51] fill-[#E76F51]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-ink">Menunggu Pasangan</h4>
            <p className="mt-1 text-xs text-[#757068] leading-relaxed">
              Bagikan tautan ini ke doi atau teman agar bisa langsung foto berdua.
            </p>
          </div>

          {/* Quick Share Buttons */}
          <div className="mt-2 flex flex-col sm:flex-row items-center gap-2 w-full">
            <button
              onClick={onShareWhatsApp}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] text-white px-3.5 py-2 text-xs font-bold hover:bg-[#1EBE5D] transition-colors cursor-pointer active:scale-95"
            >
              <MessageCircle className="size-3.5 fill-white" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onCopyLink}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#E6DFD5] bg-white px-3.5 py-2 text-xs font-bold text-ink hover:bg-[#FAF9F5] transition-colors cursor-pointer active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-[#757068]" />
                  <span>Salin Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Connected State */
        <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex size-16 items-center justify-center rounded-xl bg-emerald-100 text-3xl">
            👋
          </div>
          <h4 className="text-sm font-bold text-ink">Teman Sudah Bergabung!</h4>
          <span className="text-xs text-emerald-700 font-medium">Siap foto berdua</span>
        </div>
      )}

      {/* Small subtle tester toggle */}
      <button
        onClick={onToggleTestPeer}
        className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-semibold text-[#757068] hover:text-ink bg-white/70 rounded-full px-2 py-0.5 border border-[#E6DFD5] transition-colors cursor-pointer"
        title="Uji simulasi teman terhubung"
      >
        <RotateCcw className="size-2.5" />
        <span>{isPeerJoined ? "Reset" : "Tes Berdua"}</span>
      </button>
    </div>
  );
}
