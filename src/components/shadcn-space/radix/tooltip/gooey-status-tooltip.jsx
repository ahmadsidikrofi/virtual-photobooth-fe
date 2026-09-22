"use client";;
import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Wifi } from "lucide-react";

const MotionButton = motion(Button);

const DEFAULT_DIMENSIONS = {
  min: 40,
  gap: 12,
  max: 230,
};

const DEFAULT_STATS = [
  { key: "status", label: "Status", value: "Operational", tone: "success" },
  { key: "latency", label: "Latency", value: "24 ms" },
  { key: "region", label: "Region", value: "ap-south-1" },
];

const toneDotClass = {
  default: "bg-background/50",
  success: "bg-teal-400",
  warning: "bg-amber-400",
  danger: "bg-red-500",
};

const DIRECTION_ORDER = ["right", "left", "bottom", "top"];
const OPPOSITE_DIRECTION = {
  right: "left",
  left: "right",
  top: "bottom",
  bottom: "top",
};

const ALL_EDGES = ["left", "right", "top", "bottom"];

/**
 * Builds the anchor/offset pair for one direction: `growEdge` is pinned near
 * the trigger (0 when closed, min+gap when open) while `crossEdge` stays put
 * and the remaining two edges are left "auto" so they don't fight the layout.
 */
const makeDirectionConfig = (growEdge, crossEdge, transformOrigin, squashKey, minSize, gapSize) => {
  const autoEdges = ALL_EDGES.filter((edge) => edge !== growEdge && edge !== crossEdge);
  const withAuto = (value) => {
    const style = { [growEdge]: value, [crossEdge]: 0 };
    autoEdges.forEach((edge) => {
      style[edge] = "auto";
    });
    return style;
  };

  return {
    closedStyle: withAuto(0),
    openStyle: withAuto(minSize + gapSize),
    transformOrigin,
    squashKey,
  };
};

const getDirectionConfig = (minSize, gapSize) => ({
  right: makeDirectionConfig("left", "top", "left center", "scaleX", minSize, gapSize),
  left: makeDirectionConfig("right", "top", "right center", "scaleX", minSize, gapSize),
  bottom: makeDirectionConfig("top", "left", "center top", "scaleY", minSize, gapSize),
  top: makeDirectionConfig("bottom", "left", "center bottom", "scaleY", minSize, gapSize),
});

const getPanelVariants = (dir, minSize, maxSize, gapSize) => {
  const dirConfig = getDirectionConfig(minSize, gapSize);
  const cfg = dirConfig[dir];

  return {
    closed: {
      ...cfg.closedStyle,
      scaleX: 1,
      scaleY: 1,
      borderRadius: minSize / 2,
      width: minSize,
      height: minSize,
      transition: {
        type: "spring",
        bounce: 0.15,
        duration: 0.35,
        left: { delay: 0.18 },
        right: { delay: 0.18 },
        top: { delay: 0.18 },
        bottom: { delay: 0.18 },
        width: { delay: 0 },
        height: { delay: 0 },
      },
    },

    open: {
      ...cfg.openStyle,
      [cfg.squashKey]: [1, 1.12, 1],
      borderRadius: 14,
      width: maxSize,
      height: "auto",
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.6,
        width: { delay: 0.12 },
        height: { delay: 0.12, type: "spring", bounce: 0.35 },
        borderRadius: { delay: 0.12 },
        [cfg.squashKey]: { delay: 0.12, duration: 0.5 },
      },
    }
  };
};

const listVariants = {
  closed: { opacity: 0 },
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.24 },
  },
};

const rowVariants = {
  closed: { opacity: 0, scale: 0.75, y: 6 },
  open: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.55, duration: 0.5 },
  },
};

export function GooeyStatusTooltip({
  title,
  data = DEFAULT_STATS,
  direction = "top",
  icon: Icon = Wifi,
  triggerLabel = "Show status details",
  className,
  buttonClassName,
  triggerSize = 24,
  panelWidth = 230,
  gapSize = 8,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedDirection, setResolvedDirection] = useState(direction === "auto" ? "top" : direction);
  const filterId = useId();
  const wrapperRef = useRef(null);

  const resolveDirection = () => {
    const el = wrapperRef.current;
    if (!el || typeof window === "undefined") return;

    const rect = el.getBoundingClientRect();
    const requiredWidth = panelWidth + gapSize;
    const requiredHeight = 32 + data.length * 28 + gapSize + (title ? 24 : 0);

    const space = {
      right: window.innerWidth - rect.right,
      left: rect.left,
      bottom: window.innerHeight - rect.bottom,
      top: rect.top,
    };
    const required = {
      right: requiredWidth,
      left: requiredWidth,
      bottom: requiredHeight,
      top: requiredHeight,
    };
    const fits = (dir) => space[dir] >= required[dir];

    if (direction !== "auto") {
      if (fits(direction)) return setResolvedDirection(direction);
      if (fits(OPPOSITE_DIRECTION[direction])) {
        return setResolvedDirection(OPPOSITE_DIRECTION[direction]);
      }
    }

    const best =
      DIRECTION_ORDER.find(fits) ??
      DIRECTION_ORDER.reduce((a, b) => (space[b] > space[a] ? b : a));
    setResolvedDirection(best);
  };

  const handleEnter = () => {
    resolveDirection();
    setIsOpen(true);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    resolveDirection();
    setIsOpen((prev) => !prev);
  };

  // Tutup tooltip saat pengguna mengetuk di luar area tooltip pada perangkat mobile
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDownOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
    };
  }, [isOpen]);

  const panelVariants = useMemo(
    () => getPanelVariants(resolvedDirection, triggerSize, panelWidth, gapSize),
    [resolvedDirection, triggerSize, panelWidth, gapSize]
  );
  const dirConfig = useMemo(
    () => getDirectionConfig(triggerSize, gapSize),
    [triggerSize, gapSize]
  );
  const panelTransformOrigin = dirConfig[resolvedDirection].transformOrigin;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center bg-transparent",
        className,
      )}
    >
      <svg className="absolute left-0 top-0 h-0 w-0 pointer-events-none">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="2.0"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      <div
        ref={wrapperRef}
        style={{ filter: `url(#${filterId})` }}
        className="relative"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setIsOpen(false)}
      >
        <MotionButton
          type="button"
          size="icon"
          aria-label={triggerLabel}
          onClick={handleToggle}
          animate={{ rotate: isOpen ? [0, -14, 10, 0] : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ width: triggerSize, height: triggerSize }}
          className={cn(
            "relative z-20 cursor-pointer rounded-full p-0 bg-[#1F1A16] hover:bg-[#2A231E] text-[#FAF9F5] transition-colors",
            buttonClassName
          )}
        >
          <Icon className="size-3.5" />
        </MotionButton>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="status-panel"
              variants={panelVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{ transformOrigin: panelTransformOrigin }}
              className="absolute overflow-hidden bg-[#1F1A16] text-[#FAF9F5] z-10 shadow-xl rounded-2xl"
            >
              <motion.div
                variants={listVariants}
                initial="closed"
                animate="open"
                exit="closed"
                style={{ width: panelWidth }}
                className="flex flex-col gap-1.5 p-3 shrink-0"
              >
                {title && (
                  <span className="text-[11px] font-bold text-[#FAF9F5]/90 border-b border-white/15 pb-1 mb-0.5 tracking-wide">
                    {title}
                  </span>
                )}
                {data.map((item) => (
                  <motion.div
                    key={item.key}
                    variants={rowVariants}
                    className="flex items-center justify-between gap-3 text-[#FAF9F5]"
                  >
                    <span className="text-xs font-semibold text-[#FAF9F5]/90">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const GooeyStatusTooltipDemo = () => {
  return <GooeyStatusTooltip />;
};

export default GooeyStatusTooltipDemo;
