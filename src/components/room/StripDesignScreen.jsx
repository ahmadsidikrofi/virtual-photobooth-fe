"use client";

import { useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { PhotostripSheet } from "./PhotostripSheet";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";

const PAPER_SWATCHES = [
  { id: "#FFFFFF", name: "White", hex: "#FFFFFF", border: "border-zinc-300" },
  { id: "#F6F3EB", name: "Newsprint", hex: "#F6F3EB", border: "border-[#D6CEBE]" },
  { id: "#F9F6F0", name: "Warm Cream", hex: "#F9F6F0", border: "border-zinc-300" },
  { id: "#E7E5E4", name: "Muted Stone", hex: "#E7E5E4", border: "border-zinc-300" },
  { id: "#18181B", name: "Soft Noir", hex: "#18181B", border: "border-zinc-700" },
];

const BASE_FRAME_OPTIONS = [
  { id: "pure-white", name: "Pure" },
  { id: "daily-news", name: "Editorial" },
  { id: "distance-thread", name: "Thread" },
  { id: "filmstrip", name: "35mm Film" },
];

const ARTISANAL_1X4_OPTIONS = [
  { id: "polaroid-chin", name: "Classic Polaroid" },
  { id: "airmail-post", name: "Airmail String" },
  { id: "retro-seluloid", name: "Retro Seluloid" },
];

const ARTISANAL_1X3_OPTIONS = [
  { id: "newspaper-full", name: "The Daily News" },
];

const FILTER_OPTIONS = [
  { id: "normal", name: "Normal" },
  { id: "bw", name: "B&W" },
  { id: "warm", name: "Warm" },
  { id: "fade", name: "Fade" },
];

export function StripDesignScreen({
  curatedPhotos: propCuratedPhotos,
  selectedLayout: propSelectedLayout,
  roomId = "",
  studioMode = "solo",
  onBackToCurate,
  onRetake,
}) {
  const stripRef = useRef(null);

  // 1. Connect to Global Zustand Store (Preserved across curation navigations!)
  const storeSelectedLayout = usePhotoboothStore((s) => s.selectedLayout);
  const selectedIndices = usePhotoboothStore((s) => s.selectedIndices);
  const capturedPhotos = usePhotoboothStore((s) => s.capturedPhotos);

  const selectedFrameId = usePhotoboothStore((s) => s.selectedFrameId);
  const paperColor = usePhotoboothStore((s) => s.paperColor);
  const activeFilter = usePhotoboothStore((s) => s.activeFilter);
  const footerTexts = usePhotoboothStore((s) => s.footerTexts);
  const isExporting = usePhotoboothStore((s) => s.isExporting);

  const setSelectedFrameId = usePhotoboothStore((s) => s.setSelectedFrameId);
  const setPaperColor = usePhotoboothStore((s) => s.setPaperColor);
  const setActiveFilter = usePhotoboothStore((s) => s.setActiveFilter);
  const setFooterTexts = usePhotoboothStore((s) => s.setFooterTexts);
  const setIsExporting = usePhotoboothStore((s) => s.setIsExporting);

  const selectedLayout = propSelectedLayout || storeSelectedLayout;
  const curatedPhotos =
    propCuratedPhotos && propCuratedPhotos.length > 0
      ? propCuratedPhotos
      : selectedIndices.map((idx) => capturedPhotos[idx]);

  // Safely fallback to base frame if layout switched away from matching artisanal frame
  useEffect(() => {
    const is1x4Artisanal = ARTISANAL_1X4_OPTIONS.some((f) => f.id === selectedFrameId);
    const is1x3Artisanal = selectedFrameId === "newspaper-full";

    if (selectedLayout !== "strip_1x4" && is1x4Artisanal) {
      setSelectedFrameId("pure-white");
    } else if (selectedLayout !== "strip_1x3" && is1x3Artisanal) {
      setSelectedFrameId("pure-white");
    }
  }, [selectedLayout, selectedFrameId, setSelectedFrameId]);

  // Adjust default route note for duo mode if not customized yet
  useEffect(() => {
    if (studioMode === "duo" && footerTexts.note === "BDG • 04:20 PM") {
      setFooterTexts({ note: "JKT ➔ BDG" });
    }
  }, [studioMode, footerTexts.note, setFooterTexts]);

  // 2. Export Image Logic using html-to-image with precise non-clipped dimensions
  const handleExport = async () => {
    if (!stripRef.current || isExporting) return;
    setIsExporting(true);

    try {
      const node = stripRef.current;
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        quality: 1.0,
        cacheBust: true,
        width: node.offsetWidth,
        height: node.offsetHeight,
        style: {
          transform: "none",
          margin: "0",
        },
      });

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[:T]/g, "-");
      const filename = `snapmate-strip-${timestamp}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Gagal mengekspor strip foto:", err);
      alert("Terjadi kendala saat menyiapkan berkas gambar. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-zinc-100/80 -mx-4 sm:-mx-6 -my-5 sm:-my-8 px-4 sm:px-8 py-6 sm:py-10 animate-in fade-in duration-300">
      <div className="mx-auto max-w-5xl">
        {/* Workspace Grid Layout: Left Preview, Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ===================================================================== */}
          {/* SISI KIRI: Pratinjau Lembaran Strip (Melayang Terpusat)               */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            {/* Context Badge */}
            <div className="mb-4 flex items-center justify-between w-full max-w-[340px] px-1 text-xs text-zinc-500">
              <span className="font-semibold">Pratinjau Lembaran Cetak</span>
              {studioMode === "duo" && (
                <span className="font-mono text-[11px] text-zinc-400">Bilik Berdua</span>
              )}
            </div>

            {/* Strip Preview Container (Sticky on desktop for effortless curation) */}
            <div className="sticky top-6 flex items-center justify-center p-2 sm:p-6 w-full">
              <PhotostripSheet
                ref={stripRef}
                photos={curatedPhotos}
                layoutId={selectedLayout}
                selectedFrameId={selectedFrameId}
                paperColor={paperColor}
                activeFilter={activeFilter}
                footerTexts={footerTexts}
              />
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SISI KANAN: Panel Kontrol Minimalis                                   */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200 p-5 sm:p-6 shadow-xs flex flex-col gap-6">
            {/* Header: Tombol kembali ke kurasi */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <button
                type="button"
                onClick={onBackToCurate}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <ArrowLeft className="size-3.5" />
                <span>Ganti Foto</span>
              </button>

              <span className="text-[11px] font-mono text-zinc-400">
                {curatedPhotos.length} foto terpilih
              </span>
            </div>

            {/* 1. Pilihan Bingkai */}
            <div className="space-y-3">
              {/* A. 4 Tema Bingkai Dinamis (Format Standar) - Selalu ada di atas untuk SEMUA layout */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700">
                    Tema Bingkai
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Format Standar
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {BASE_FRAME_OPTIONS.map((frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => {
                        setSelectedFrameId(frame.id);
                        if (frame.id === "filmstrip" && paperColor === "#FFFFFF") {
                          setPaperColor("#18181B");
                        }
                      }}
                      className={`rounded-xl py-2 px-3 text-xs font-bold transition-all text-center cursor-pointer ${
                        selectedFrameId === frame.id
                          ? "bg-zinc-900 text-white shadow-xs"
                          : "border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                      }`}
                    >
                      {frame.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* B. Edisi Koleksi Khusus per Dimensi Grid (di bawah 4 bingkai dinamis) */}
              {/* Khusus Layout 1x4 */}
              {selectedLayout === "strip_1x4" && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700">
                      Edisi Koleksi 1×4
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Artisanal Frames
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {ARTISANAL_1X4_OPTIONS.map((frame) => (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => {
                          setSelectedFrameId(frame.id);
                          if (frame.id === "retro-seluloid" && paperColor === "#FFFFFF") {
                            setPaperColor("#18181B");
                          }
                          if (frame.id === "airmail-post" && paperColor === "#18181B") {
                            setPaperColor("#F9F6F0");
                          }
                        }}
                        className={`rounded-xl py-2 px-2.5 text-xs font-bold transition-all text-center cursor-pointer ${
                          selectedFrameId === frame.id
                            ? "bg-zinc-900 text-white shadow-xs"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        {frame.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Khusus Layout 1x3 */}
              {selectedLayout === "strip_1x3" && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700">
                      Edisi Koleksi 1×3
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Format Koran
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {ARTISANAL_1X3_OPTIONS.map((frame) => (
                      <button
                        key={frame.id}
                        type="button"
                        onClick={() => {
                          setSelectedFrameId(frame.id);
                          if (paperColor === "#18181B" || paperColor === "#FFFFFF") {
                            setPaperColor("#F6F3EB");
                          }
                        }}
                        className={`rounded-xl py-2.5 px-3 text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-between ${
                          selectedFrameId === frame.id
                            ? "bg-zinc-900 text-white shadow-xs"
                            : "border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        <span>{frame.name}</span>
                        <span className="text-[10px] font-mono font-normal opacity-70">
                          Masthead & Editorial
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Pilihan Warna Kertas (Swatches) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">
                Warna Kertas
              </label>
              <div className="flex items-center gap-3">
                {PAPER_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.id}
                    type="button"
                    title={swatch.name}
                    onClick={() => setPaperColor(swatch.hex)}
                    style={{ backgroundColor: swatch.hex }}
                    className={`size-7 rounded-full border ${swatch.border} transition-transform active:scale-95 cursor-pointer ${paperColor === swatch.hex
                        ? "ring-2 ring-offset-2 ring-zinc-900 scale-105 shadow-xs"
                        : "opacity-85 hover:opacity-100"
                      }`}
                  />
                ))}
                <span className="text-xs text-zinc-400 font-medium ml-1">
                  {PAPER_SWATCHES.find((s) => s.hex === paperColor)?.name}
                </span>
              </div>
            </div>

            {/* 3. Pilihan Filter Foto */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700">
                Filter Foto
              </label>
              <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-zinc-100 p-1 border border-zinc-200">
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`rounded-lg py-1.5 text-xs font-bold transition-all cursor-pointer ${activeFilter === filter.id
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "text-zinc-600 hover:text-zinc-900"
                      }`}
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Kustomisasi Teks Footer */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-zinc-700">
                Kustomisasi Teks Lembaran
              </label>

              <div className="space-y-2.5">
                {/* Input 1: Judul */}
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    {selectedFrameId === "newspaper-full"
                      ? "Tajuk Surat Kabar"
                      : "Judul Strip"}
                  </span>
                  <input
                    type="text"
                    value={footerTexts.title}
                    onChange={(e) =>
                      setFooterTexts((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder={
                      selectedFrameId === "newspaper-full"
                        ? "Inspirasi Harian"
                        : "Snapmate"
                    }
                    className="w-full border-b border-zinc-300 focus:border-zinc-900 focus:outline-hidden bg-transparent text-sm py-1 transition-colors text-zinc-900 font-medium placeholder:text-zinc-300"
                  />
                </div>

                {/* Input 2: Tanggal */}
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400">Tanggal / Edisi</span>
                  <input
                    type="text"
                    value={footerTexts.subtitle}
                    onChange={(e) =>
                      setFooterTexts((prev) => ({ ...prev, subtitle: e.target.value }))
                    }
                    placeholder="10.09.2026"
                    className="w-full border-b border-zinc-300 focus:border-zinc-900 focus:outline-hidden bg-transparent text-sm py-1 transition-colors text-zinc-900 font-medium placeholder:text-zinc-300"
                  />
                </div>

                {/* Input 3: Lokasi / Catatan / Headline */}
                <div>
                  <span className="text-[10px] font-semibold text-zinc-400">
                    {selectedFrameId === "distance-thread" || selectedFrameId === "airmail-post"
                      ? "Rute Jarak (LDR)"
                      : selectedFrameId === "newspaper-full"
                        ? "Headline Berita"
                        : "Lokasi / Waktu"}
                  </span>
                  <input
                    type="text"
                    value={footerTexts.note}
                    onChange={(e) =>
                      setFooterTexts((prev) => ({ ...prev, note: e.target.value }))
                    }
                    placeholder={
                      selectedFrameId === "distance-thread" || selectedFrameId === "airmail-post"
                        ? "JKT ➔ BDG"
                        : selectedFrameId === "newspaper-full"
                          ? "KISAH DUA HATI"
                          : "BDG • 04:20 PM"
                    }
                    className="w-full border-b border-zinc-300 focus:border-zinc-900 focus:outline-hidden bg-transparent text-sm py-1 transition-colors text-zinc-900 font-medium placeholder:text-zinc-300"
                  />
                </div>
              </div>
            </div>

            {/* 5. Tombol Unduh Utama (Bottom CTA) */}
            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-black text-white py-3.5 px-6 font-bold text-sm shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Menyiapkan lembaran...</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4" />
                    <span>Unduh Strip (PNG)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onRetake}
                className="text-center text-xs font-semibold text-zinc-400 hover:text-zinc-700 transition-colors py-1 cursor-pointer"
              >
                Selesai & Mulai Sesi Baru
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
