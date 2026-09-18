"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck, Users, Check, Download, BedDouble } from "lucide-react";
import ButtonBlobFill from "../shadcn-space/radix/button/button-blob-fill";
import { useRouter } from "next/navigation";
import { generateRoomId, validateRoomCode } from "@/lib/room";
import { RoomTransitionOverlay } from "@/components/room/RoomTransitionOverlay";
import { toast } from "@/components/ui/toast";

export function RoomActionCard({ onRoomCreated }) {
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'join'
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Rule 2: Jika user mengetik simbol selain alfabet (dan tanda hubung '-'), border input berubah menjadi merah
  const hasInvalidChars = Boolean(roomCodeInput && /[^a-zA-Z-]/.test(roomCodeInput));

  // Generate Google Meet-style room code (e.g. "ere-nfuw-tqp") and redirect smoothly
  const handleCreateInstantRoom = () => {
    const newRoomId = generateRoomId();
    if (typeof window !== "undefined") {
      try {
        const cleanId = newRoomId.toLowerCase().replace(/[^a-z0-9_-]/g, "");
        sessionStorage.setItem(`snapmate_host_${cleanId}`, "true");
      } catch {}
    }
    setIsTransitioning(true);
    if (onRoomCreated) {
      onRoomCreated(newRoomId);
    }
    router.push(`/room/${newRoomId}`);
  };

  // Rule 1: Ketika user tempelkan kode contoh kodenya gcmftwbrzj ketika ditempel otomatis menjadi gcm-ftwb-rzj
  const handlePaste = (e) => {
    const pastedText = e.clipboardData?.getData("text") || "";
    if (!pastedText) return;

    let cleanText = pastedText.trim();
    if (cleanText.includes("/room/")) {
      const parts = cleanText.split("/room/");
      cleanText = parts[parts.length - 1].split("?")[0].split("#")[0].trim();
    } else if (cleanText.includes("/")) {
      const parts = cleanText.split("/");
      cleanText = parts[parts.length - 1].split("?")[0].split("#")[0].trim();
    }

    const lettersOnly = cleanText.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (lettersOnly.length === 10) {
      e.preventDefault();
      const formatted = `${lettersOnly.slice(0, 3)}-${lettersOnly.slice(3, 7)}-${lettersOnly.slice(7, 10)}`;
      setRoomCodeInput(formatted);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Auto-format jika user mengetik atau menempel 10 huruf tanpa tanda hubung
    const lettersOnly = val.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (!val.includes("-") && lettersOnly.length === 10 && val.length === 10) {
      const formatted = `${lettersOnly.slice(0, 3)}-${lettersOnly.slice(3, 7)}-${lettersOnly.slice(7, 10)}`;
      setRoomCodeInput(formatted);
      return;
    }
    setRoomCodeInput(val);
  };

  // Rule 3: Validasi kode room saat submit. Jika tidak valid / tidak 10 huruf, beri Toast error
  const handleJoin = (e) => {
    e?.preventDefault();
    const raw = roomCodeInput.trim();
    if (!raw) return;

    const { isValid, formattedCode } = validateRoomCode(raw);

    if (!isValid) {
      toast.add({
        title: "Ruangan Tidak Ditemukan",
        description: "Ruangan yang mau dimasuki tidak ditemukan, silahkan login dengan akun yang benar.",
      });
      return;
    }

    setIsTransitioning(true);
    router.push(`/room/${formattedCode}`);
  };

  return (
    <>
      <div className="w-full max-w-lg rounded-3xl border-2 border-[#E6DFD5] bg-[#EFE9DE]/70 p-4 sm:p-5 shadow-[0_12px_36px_rgba(31,26,22,0.06)] backdrop-blur-sm">
        {/* Switcher Tab */}
        <div className="flex rounded-xl bg-[#FAF9F5] p-1.5 border border-[#E6DFD5]">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${activeTab === "create"
              ? "bg-[#F5A623] text-[#1F1A16] shadow-sm scale-[1.01]"
              : "text-[#757068] hover:text-[#1F1A16]"
              }`}
          >
            <BedDouble className="size-4" />
            <span>Bikin Room Baru</span>
          </button>
          <button
            onClick={() => setActiveTab("join")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${activeTab === "join"
              ? "bg-[#F5A623] text-[#1F1A16] shadow-sm scale-[1.01]"
              : "text-[#757068] hover:text-[#1F1A16]"
              }`}
          >
            <Users className="size-4" />
            <span>Gabung via Kode</span>
          </button>
        </div>

        {/* Tab Content: BIKIN ROOM */}
        {activeTab === "create" && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-xl border border-[#E6DFD5] bg-[#FAF9F5] p-4 text-left">
              <h4 className="text-sm font-extrabold text-[#1F1A16]">
                Bilik Foto Privat Sekali Klik
              </h4>
              <p className="mt-1 text-xs text-[#757068] leading-relaxed">
                Bikin bilik fotomu sekarang. Cukup satu klik, dapat tautan, langsung ajak doi atau bestie foto bareng tanpa instal aplikasi.
              </p>
            </div>

            <ButtonBlobFill
              name="Bikin Room Gratis"
              onClick={handleCreateInstantRoom}
              className="w-full justify-center bg-[#F5A623] hover:bg-[#D98A12] text-[#1F1A16] border-none py-3.5 text-sm sm:text-base font-extrabold shadow-sm"
            />
          </div>
        )}

        {/* Tab Content: GABUNG ROOM */}
        {activeTab === "join" && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="rounded-xl border border-[#E6DFD5] bg-[#FAF9F5] p-4 text-left">
              <label className="text-xs font-bold text-[#1F1A16] block">
                Masukkan Kode atau Tautan Room
              </label>
              <p className="mt-0.5 text-[11px] text-[#757068]">
                Punya tautan dari teman? Tempel di bawah untuk langsung masuk.
              </p>
              <form onSubmit={handleJoin} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={handleInputChange}
                  onPaste={handlePaste}
                  placeholder="Contoh: ere-nfuw-tqp"
                  className={`flex-1 rounded-xl border px-3.5 py-2.5 font-mono text-sm placeholder-[#9C968C] transition-all focus:outline-none ${hasInvalidChars
                    ? "border-red-500 bg-red-50/50 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-[#E6DFD5] bg-[#F5F0E8] text-[#1F1A16] focus:border-[#F5A623] focus:ring-2 focus:ring-[#F5A623]/20"
                    }`}
                />
                <button
                  type="submit"
                  disabled={!roomCodeInput.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-[#F5A623] px-5 py-2.5 text-sm font-bold text-[#1F1A16] transition-colors hover:bg-[#D98A12] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  <span>Masuk</span>
                  <ArrowRight className="size-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Micro Value Proposition Badges - Simple, Clean, Non-Technical */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6DFD5] pt-3 text-[11px] font-semibold text-[#757068]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-[#38A89D]" />
            <span>Privat & Terhapus 24 Jam</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="size-3.5 text-[#F5A623]" />
            <span>100% Gratis</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="size-3.5 text-[#E76F51]" />
            <span>Tanpa Install Aplikasi</span>
          </div>
        </div>
      </div>

      {/* Google Meet-style smooth transition overlay */}
      {isTransitioning && <RoomTransitionOverlay message="Bergabung..." />}
    </>
  );
}
