"use client";

import { Navbar } from "@/components/navbar/Navbar";
import { HeroSection } from "@/components/hero/HeroSection";
import { FrameGallerySection } from "@/components/frames/FrameGallerySection";
import { HowItWorksSection } from "@/components/how-it-works/HowItWorksSection";
import { FaqSection } from "@/components/faq/FaqSection";
import { Footer } from "@/components/footer/Footer";

export default function Home() {
  const scrollToHeroAction = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-fun-yellow/30 selection:text-ink">
      {/* 1. Sticky Navbar */}
      <Navbar onStartClick={scrollToHeroAction} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section: Hook Utama & Instant Action */}
        <HeroSection onStartClick={scrollToHeroAction} />

        {/* 3. Koleksi Frame: Pure White & Filmstrip 35mm */}
        <FrameGallerySection />

        {/* 4. How It Works: Tiga Langkah Cepat */}
        <HowItWorksSection onStartClick={scrollToHeroAction} />

        {/* 5. FAQ Section: Pertanyaan yang Sering Diajukan */}
        <FaqSection />
      </main>

      {/* 5. Minimalist & Bold Footer (Antigravity Style) */}
      <Footer />
    </div>
  );
}
