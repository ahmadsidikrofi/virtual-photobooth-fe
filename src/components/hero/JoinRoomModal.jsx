"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowRight, KeyRound, Clipboard, AlertCircle } from "lucide-react";
import { cleanRoomId } from "@/lib/room";

export function JoinRoomModal({ isOpen, onClose }) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  const handleClose = useCallback(() => {
    setError("");
    setInputCode("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const handleJoin = (e) => {
    e?.preventDefault();
    const cleaned = cleanRoomId(inputCode);
    if (!cleaned) {
      setError("Silakan ketik kode room atau tempel tautan terlebih dahulu.");
      return;
    }
    if (cleaned.length < 4) {
      setError("Kode room minimal 4 karakter (contoh: ere-nfuw-tqp).");
      return;
    }
    setError("");
    setInputCode("");
    onClose();
    router.push(`/room/${cleaned}`);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputCode(text);
        setError("");
      }
    } catch {
      // Clipboard access not allowed or unavailable
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl border border-[#E6DFD5] bg-[#FAF9F5] p-6 shadow-2xl text-left animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 flex size-8 items-center justify-center rounded-full text-[#757068] hover:bg-[#EFE9DE] hover:text-[#1F1A16] transition-colors"
          aria-label="Tutup"
        >
          <X className="size-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-fun-yellow/20 text-[#1F1A16]">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">Gabung via Kode</h3>
            <p className="text-xs text-[#757068]">
              Masukkan kode unik atau tautan undangan dari temanmu.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleJoin} className="mt-5 flex flex-col gap-3">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                if (error) setError("");
              }}
              placeholder="Contoh: ere-nfuw-tqp atau link room"
              className="w-full rounded-xl border-2 border-[#E6DFD5] bg-white px-4 py-3 font-mono text-sm sm:text-base text-ink placeholder-[#A29C91] transition-all focus:border-[#F5A623] focus:outline-none pr-12"
            />
            {/* Quick Paste Button */}
            <button
              type="button"
              onClick={handlePaste}
              title="Tempel dari Clipboard"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#757068] hover:text-ink hover:bg-[#EFE9DE] rounded-lg transition-colors"
            >
              <Clipboard className="size-4" />
            </button>
          </div>

          {/* Error message if any */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent-red">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-[11px] text-[#8C8477]">
            Format kode mirip Google Meet (misal: <code className="font-mono font-semibold text-ink">ere-nfuw-tqp</code>).
          </p>

          {/* Action Buttons */}
          <div className="mt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#757068] hover:bg-[#EFE9DE] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#F5A623] px-5 py-2.5 text-xs sm:text-sm font-bold text-ink shadow-sm hover:bg-[#D98A12] active:scale-95 transition-all"
            >
              <span>Masuk Room</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
