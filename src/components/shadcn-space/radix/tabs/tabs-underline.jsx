"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Smile, Laugh, Hourglass } from "lucide-react";

export const defaultTabs = [
  { id: "classic", label: "Sesi Foto Klasik", icon: Camera },
  { id: "head-tilt", label: "Head-Tilt Vibe Check", icon: Smile },
  { id: "face-mimic", label: "Face Mimic", icon: Laugh },
  { id: "time-capsule", label: "Kapsul Waktu", icon: Hourglass },
];

const variants = {
  enter: (dir) => ({
    x: dir > 0 ? 32 : -32,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir) => ({
    x: dir > 0 ? -32 : 32,
    opacity: 0,
  }),
};

const transition = {
  type: "spring",
  stiffness: 340,
  damping: 32,
};

export default function TabsUnderline({
  tabs = defaultTabs,
  activeTab: controlledActiveTab,
  onTabChange,
  className = "",
}) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id);
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const [hoveredTab, setHoveredTab] = useState(null);
  const [direction, setDirection] = useState(1);

  const handleTabChange = (newId) => {
    const prevIdx = tabs.findIndex((t) => t.id === activeTab);
    const nextIdx = tabs.findIndex((t) => t.id === newId);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    if (onTabChange) {
      onTabChange(newId);
    } else {
      setInternalActiveTab(newId);
    }
  };

  return (
    <div className={cn("w-full mx-auto", className)}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="overflow-x-auto no-scrollbar pb-1">
          <TabsList
            variant="line"
            className="flex w-full min-w-max border-b border-[#E6DFD5] bg-transparent p-0 rounded-none h-auto gap-1 sm:gap-2 justify-start sm:justify-center"
            onMouseLeave={() => setHoveredTab(null)}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  className={cn(
                    "relative flex items-center cursor-pointer justify-center text-sm font-medium transition-colors outline-none whitespace-nowrap bg-transparent py-2.5 px-3 sm:px-4",
                    "data-[state=active]:bg-transparent data-[state=active]:text-[#1F1A16]",
                    "border-transparent data-[state=active]:border-transparent shadow-none data-[state=active]:shadow-none after:hidden",
                    isActive ? "text-[#1F1A16] font-semibold" : "text-[#757068] hover:text-[#1F1A16]"
                  )}
                >
                  {/* Pill wrapper */}
                  <span className="relative flex items-center gap-2 py-1 px-2 rounded-lg z-10">
                    {/* Hover highlight */}
                    {isHovered && (
                      <motion.span
                        layoutId="tabs-underline-hover"
                        className="absolute inset-0 bg-[#EFE9DE]/70 rounded-lg pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    {Icon && <Icon className="size-4 relative z-10" />}
                    <span className="relative z-10">{tab.label}</span>
                  </span>

                  {/* Active underline indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="tabs-underline-indicator"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-[#F5A623] rounded-full"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Slide-animated content */}
        <div className="mt-8 relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {tabs.map((tab) => {
              if (tab.id !== activeTab) return null;
              return (
                <motion.div
                  key={tab.id}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="w-full"
                >
                  {tab.content ? (
                    tab.content
                  ) : (
                    <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs">
                      <h3 className="text-lg font-semibold text-[#1F1A16] mb-2">
                        {tab.label}
                      </h3>
                      <p className="text-sm text-[#757068] leading-relaxed">
                        {tab.description || "Deskripsi mode ini akan segera hadir."}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
