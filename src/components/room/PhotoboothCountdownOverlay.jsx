"use client";

export function PhotoboothCountdownOverlay({
  sessionState,
  countdownValue,
  currentShot,
  transitionText,
  totalShots = 8,
}) {
  const isCountdown = sessionState === "countdown";
  const isFlash = sessionState === "flash";

  return (
    <>
      {/* 1. Flash Effect: 150ms pure white screen flash */}
      {isFlash && (
        <div
          className="fixed inset-0 bg-white pointer-events-none z-50 animate-in fade-in duration-75"
          aria-hidden="true"
        />
      )}

      {/* 2. Transition Between Shots: Slim non-intrusive top banner */}
      {transitionText && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="rounded-full bg-[#1F1A16]/90 border border-fun-yellow/80 px-4 py-1.5 text-center shadow-md">
            <span className="text-xs font-bold text-fun-yellow">
              {transitionText}
            </span>
          </div>
        </div>
      )}

      {/* 3. Live Countdown: Discretely placed in top-right corner so it NEVER covers user's face */}
      {isCountdown && (
        <div className="absolute top-4 right-4 z-20 pointer-events-none flex items-center gap-2 animate-in fade-in duration-150">
          {/* Shot Number Indicator (8 universal buffer shots) */}
          <div className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white/90 border border-white/10 backdrop-blur-xs">
            Pose {currentShot}/{totalShots}
          </div>

          {/* Countdown Number (Sleek corner badge) */}
          <div
            key={countdownValue}
            className="flex size-10 items-center justify-center rounded-full bg-fun-yellow text-ink font-black text-lg shadow-md ring-2 ring-[#1F1A16] animate-in zoom-in-75 duration-200"
          >
            {countdownValue}
          </div>
        </div>
      )}
    </>
  );
}
