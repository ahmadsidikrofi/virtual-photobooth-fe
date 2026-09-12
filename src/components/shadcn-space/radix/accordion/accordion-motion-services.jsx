"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const defaultFaqItems = [
  {
    id: "faq-1",
    number: "01",
    title: "Apakah saya dan teman harus mendaftar akun atau mengunduh aplikasi?",
    content:
      "Sama sekali tidak. Aplikasi ini 100% berjalan langsung di peramban (browser) ponsel maupun laptop tanpa perlu instalasi aplikasi atau registrasi email. Cukup buat room, bagikan tautan, dan langsung berfoto.",
  },
  {
    id: "faq-2",
    number: "02",
    title: "Apakah aplikasi ini benar-benar gratis?",
    content:
      "Ya, 100% gratis tanpa biaya tersembunyi dan tanpa batasan jumlah jepretan foto. Kamu bisa langsung mengunduh hasil foto strip resolusi tinggi secara cuma-cuma.",
  },
  {
    id: "faq-3",
    number: "03",
    title: "Apakah rekaman kamera dan foto kami disimpan di server?",
    content:
      "Privasimu adalah prioritas utama kami. Umpan video berjalan secara langsung antar-perangkat (peer-to-peer) tanpa direkam di server. Berkas hasil foto hanya disimpan di penyimpanan awan sementara dan otomatis terhapus permanen dalam 24 jam setelah sesi selesai.",
  },
  {
    id: "faq-4",
    number: "04",
    title: "Bisakah dipakai jika saya pakai laptop dan teman saya pakai ponsel?",
    content:
      "Sangat bisa. Sistem kami dirancang responsif lintas perangkat (Google Chrome, Safari, Firefox, dan Microsoft Edge). Pastikan saja kamu mengizinkan akses kamera dan mikrofon saat peramban memintanya.",
  },
  {
    id: "faq-5",
    number: "05",
    title: "Berapa maksimal orang yang bisa berfoto bersama di satu room?",
    content:
      "Fokus utama ruang kolaborasi saat ini dirancang optimal untuk 2 orang (sangat pas untuk pasangan LDR atau dua sahabat), namun ruangannya juga mendukung hingga 4 orang sekaligus.",
  },
  {
    id: "faq-6",
    number: "06",
    title: "Bagaimana cara kerja AI Pose Matching dan Shutter Tanpa Sentuh?",
    content:
      "Kami memanfaatkan kecerdasan buatan ringan yang berjalan langsung di perambanmu. Kamera akan membaca gestur tangan atau siluet tubuh (seperti menyatukan simbol hati). Begitu posisimu dan temanmu pas, kamera akan otomatis menjepret tanpa kamu perlu menekan tombol apa pun!",
  },
  {
    id: "faq-7",
    number: "07",
    title: "Apa itu format Live Photo + Voice Note?",
    content:
      "Selain foto statis, sistem dapat merekam suara tawa dan obrolanmu selama dua hingga tiga detik tepat saat hitung mundur berlangsung. Hasil fotomu di web viewer bisa ditekan untuk bergerak singkat sambil memutar rekaman suara momen tersebut.",
  },
];

const AccordionMotionServices = ({
  items = defaultFaqItems,
  defaultOpen = "faq-1",
  className = "",
}) => {
  const [openItem, setOpenItem] = useState(defaultOpen);
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div className={`w-full ${className}`}>
      <Accordion
        type="single"
        value={openItem}
        onValueChange={(v) => setOpenItem(v)}
        className="w-full"
      >
        {items.map((item) => {
          const isActive = openItem === item.id;
          const isHovered = hoveredId === item.id;

          return (
            <AccordionItem
              key={item.id}
              value={item.id}
              className="relative border-none py-1"
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <AccordionTrigger className="hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden px-1 py-4 sm:py-5 cursor-pointer">
                <div className="flex items-center gap-4 sm:gap-5 w-full">
                  {/* Number bubble */}
                  <div className="relative flex h-9 w-9 items-center justify-center shrink-0">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-fun-yellow"
                      initial={false}
                      animate={{
                        scale: isActive ? 1 : isHovered ? 0.85 : 0,
                        opacity: isActive ? 1 : isHovered ? 0.2 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    />
                    <motion.span
                      className="relative z-10 font-mono text-xs font-bold tracking-wider"
                      animate={{
                        color: isActive ? "#1F1A16" : "#757068",
                      }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.number}
                    </motion.span>
                  </div>

                  {/* Title / Question */}
                  <motion.span
                    className="text-left text-[14.5px] sm:text-base font-bold text-ink pr-2"
                    animate={{
                      x: isActive || isHovered ? 3 : 0,
                      color: isActive ? "#1F1A16" : "#1F1A16",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  >
                    {item.title}
                  </motion.span>

                  {/* Plus / Rotate icon */}
                  <motion.div
                    className="ml-auto flex size-8 items-center justify-center shrink-0 rounded-full bg-transparent"
                    animate={{
                      rotate: isActive ? 45 : 0,
                      opacity: isActive || isHovered ? 1 : 0.45,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Plus className="size-4 text-ink" />
                  </motion.div>
                </div>
              </AccordionTrigger>

              {/* Answer Content */}
              <AccordionContent className="pl-13 sm:pl-14 pr-4 pb-5 text-sm leading-relaxed text-[#757068]">
                {item.content}
              </AccordionContent>

              {/* Static border */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E6DFD5]/80" />

              {/* Animated active/hover line */}
              <motion.div
                className="absolute bottom-0 left-0 h-px origin-left bg-fun-yellow"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isActive ? 1 : isHovered ? 0.25 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default AccordionMotionServices;
