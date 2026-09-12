"use client";

import AccordionMotionServices from "@/components/shadcn-space/radix/accordion/accordion-motion-services";

export function FaqSection() {
  return (
    <section id="faq" className="relative py-16 sm:py-24 border-t border-[#E6DFD5] bg-canvas text-ink">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#757068] leading-relaxed max-w-xl mx-auto">
            Semua hal mendasar mengenai cara kerja, privasi video, dan kenyamanan berfoto lintas perangkat.
          </p>
        </div>

        {/* Motion Accordion FAQ */}
        <AccordionMotionServices />
      </div>
    </section>
  );
}
