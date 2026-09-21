"use client";

import {
  ChevronDown,
  Check,
  GalleryVertical,
  LayoutGrid,
  LayoutPanelTop,
} from "lucide-react";
import { GRID_CONFIGS } from "@/lib/grid-configs";
import { usePhotoboothStore } from "@/stores/usePhotoboothStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function renderLayoutIcon(layoutId, type, className) {
  if (layoutId === "editorial_8cut") return <LayoutPanelTop className={className} />;
  if (type === "strip") return <GalleryVertical className={className} />;
  return <LayoutGrid className={className} />;
}

export function PreShootControls({
  selectedLayout: propSelectedLayout,
  onSelectLayout,
  timerDuration: propTimerDuration,
  onSelectTimer,
  onStartSession,
  cameraActive,
  isLoadingCamera,
  isDuoMode = false,
  isHost = true,
  isGuest = false,
  isPeerJoined = false,
  isPeerReady = false,
  isLocalReady = false,
  isPeerCameraActive = true,
  remoteStream = null,
  onToggleReady,
}) {
  const storeLayout = usePhotoboothStore((s) => s.selectedLayout);
  const storeTimer = usePhotoboothStore((s) => s.timerDuration);
  const storeSetLayout = usePhotoboothStore((s) => s.setSelectedLayout);
  const storeSetTimer = usePhotoboothStore((s) => s.setTimerDuration);
  const sessionState = usePhotoboothStore((s) => s.sessionState);

  const selectedLayout = propSelectedLayout ?? storeLayout;
  const timerDuration = propTimerDuration ?? storeTimer;
  const handleSelectLayout = onSelectLayout ?? storeSetLayout;
  const handleSelectTimer = onSelectTimer ?? storeSetTimer;

  const isSessionActive =
    sessionState === "countdown" ||
    sessionState === "flash" ||
    sessionState === "transition";

  const currentConfig = GRID_CONFIGS[selectedLayout] || GRID_CONFIGS.strip_1x4;

  return (
    <div className="rounded-xl border border-[#E6DFD5] bg-white p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Pengaturan Format, Timer, & Mirror */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1">
        {/* 1. Format Dropdown (Dinamis dari GRID_CONFIGS via DropdownMenu) */}
        <div className="flex flex-col gap-1 min-w-[205px]">
          <span className="text-[11px] font-bold text-[#757068]">
            Format Photostrip {isDuoMode && isGuest && " (Ditentukan Host)"}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={(isDuoMode && isGuest) || isSessionActive}
              className={`w-full flex items-center justify-between gap-3 rounded-xl border border-[#E6DFD5] bg-[#FAF9F5] px-3.5 py-2 text-xs font-semibold text-ink transition-colors ${(isDuoMode && isGuest) || isSessionActive
                ? "opacity-80 cursor-default"
                : "hover:bg-[#F5F0E8] hover:border-[#D1C9BE] focus:outline-none focus:ring-2 focus:ring-fun-yellow/60 cursor-pointer"
                }`}
            >
              <div className="flex items-center gap-2 truncate">
                {renderLayoutIcon(currentConfig.id, currentConfig.type, "size-4 text-[#757068] shrink-0")}
                <span className="font-bold text-ink">{currentConfig.name}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-medium text-[#757068]">
                  {currentConfig.requiredPhotos} foto
                </span>
                {!isGuest && (
                  <ChevronDown className="size-3.5 text-[#9C968C] transition-transform duration-200" />
                )}
              </div>
            </DropdownMenuTrigger>

            {!isGuest && !isSessionActive && (
              <DropdownMenuContent
                align="start"
                sideOffset={6}
                className="w-64 rounded-2xl border border-[#E6DFD5] bg-[#FAF9F5]/98 backdrop-blur-md p-1.5 shadow-xl transition-all duration-300 ease-out data-starting-style:opacity-0 data-starting-style:scale-95 data-starting-style:translate-y-2 data-ending-style:opacity-0 data-ending-style:scale-95 data-ending-style:translate-y-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-3 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-closed:slide-out-to-bottom-2 z-50"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-2 text-[11px] font-semibold text-[#757068]">
                    Pilih Format Foto
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#E6DFD5]/70 my-1" />

                  {Object.values(GRID_CONFIGS).map((item) => {
                    const isSelected = selectedLayout === item.id;
                    return (
                      <DropdownMenuItem
                        key={item.id}
                        onClick={() => handleSelectLayout(item.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors outline-none ${isSelected
                          ? "bg-[#EFE9DE] text-ink font-bold"
                          : "text-[#3D3A35] hover:bg-[#F5F0E8] hover:text-ink font-medium"
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {renderLayoutIcon(
                            item.id,
                            item.type,
                            `size-4 shrink-0 transition-colors ${isSelected ? "text-ink" : "text-[#757068]"
                            }`
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] shrink-0">
                          <span className={isSelected ? "text-ink font-semibold" : "text-[#9C968C]"}>
                            {item.requiredPhotos} foto
                          </span>
                          {isSelected && (
                            <Check className="size-3.5 text-ink stroke-[2.5]" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>

        {/* 2. Timer Segmented Buttons */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold text-[#757068]">
            Timer
          </label>
          <div className="flex items-center rounded-xl bg-[#FAF9F5] border border-[#E6DFD5] p-0.5">
            {[3, 5, 10].map((sec) => (
              <button
                key={sec}
                type="button"
                disabled={(isDuoMode && isGuest) || isSessionActive}
                onClick={() => handleSelectTimer(sec)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${(isDuoMode && isGuest) || isSessionActive ? "cursor-default opacity-60" : "cursor-pointer"
                  } ${timerDuration === sec
                    ? "bg-[#1F1A16] text-white shadow-xs"
                    : "text-[#757068] hover:text-ink"
                  }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Tombol Utama CTA (Mulai Sesi Foto / Status Siap) */}
      <div className="w-full md:w-auto shrink-0 flex flex-col items-center md:items-end gap-1">
        {isDuoMode && isGuest ? (
          // GUEST: Tombol Toggle Status "Saya Siap"
          <div className="flex flex-col items-center md:items-end gap-1.5 w-full md:w-auto">
            <button
              type="button"
              onClick={onToggleReady}
              disabled={!cameraActive || isLoadingCamera || isSessionActive}
              className={`w-full md:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-extrabold transition-all shadow-sm active:scale-95 ${!cameraActive || isLoadingCamera || isSessionActive
                ? "bg-[#F5E4C4] text-[#9C968C] cursor-not-allowed opacity-60"
                : isLocalReady
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                  : "bg-fun-yellow hover:bg-[#D98A12] text-ink cursor-pointer"
                }`}
            >
              {isLocalReady ? (
                <>
                  <Check className="size-4 stroke-[3]" />
                  <span>Saya Sudah Siap</span>
                </>
              ) : (
                <span>Tandai Saya Siap Foto</span>
              )}
            </button>
            <span className="text-[11px] font-medium text-[#757068]">
              {isSessionActive
                ? "Sesi foto sedang berlangsung..."
                : "Menunggu Host memulai jepretan foto..."}
            </span>
          </div>
        ) : (
          // HOST / SOLO: Tombol Mulai Sesi Foto
          <div className="flex flex-col items-center md:items-end gap-1.5 w-full md:w-auto">
            <button
              type="button"
              onClick={onStartSession}
              disabled={
                !cameraActive ||
                isLoadingCamera ||
                isSessionActive ||
                (isDuoMode && (!remoteStream || !isPeerCameraActive || !isPeerReady))
              }
              className={`w-full md:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-extrabold transition-all shadow-sm active:scale-95 ${!cameraActive ||
                isLoadingCamera ||
                isSessionActive ||
                (isDuoMode && (!remoteStream || !isPeerCameraActive || !isPeerReady))
                ? "bg-[#F5E4C4] text-[#9C968C] cursor-not-allowed opacity-60"
                : "bg-fun-yellow hover:bg-[#D98A12] text-ink cursor-pointer hover:shadow-md"
                }`}
            >
              <span>
                {isSessionActive
                  ? "Sesi Foto Sedang Berlangsung..."
                  : isDuoMode
                    ? "Mulai Sesi Foto Berdua"
                    : "Mulai Sesi Foto (8 Jepretan)"}
              </span>
            </button>
            {isDuoMode && (
              <span className="text-[11px] font-medium text-[#757068]">
                {isSessionActive
                  ? "Sesi foto sedang berlangsung..."
                  : !remoteStream
                    ? "Menunggu teman bergabung via tautan untuk mulai berdua..."
                    : !isPeerCameraActive
                      ? "Menunggu teman menyalakan kamera untuk mulai berdua..."
                      : isPeerReady
                        ? "✓ Teman sudah siap, jangan bikin dia menunggu"
                        : "Teman sudah terhubung (menunggu teman siap)"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
