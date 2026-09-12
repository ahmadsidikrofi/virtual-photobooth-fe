import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#E6DFD5] bg-canvas text-ink pt-16 sm:pt-20 pb-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col justify-between min-h-[420px]">
        {/* ========================================================= */}
        {/* 1. Top Section: Tagline (Kiri) & Link Columns (Kanan)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 items-start">
          {/* Kolom Kiri: Tagline */}
          <div className="md:col-span-6 lg:col-span-7 flex flex-col">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              Dua Layar, Sejiwa.
            </h3>
            <p className="mt-3 text-sm sm:text-base text-[#757068] max-w-md leading-relaxed">
              Virtual photobooth real-time untuk pasangan LDR, sahabat, dan bestie.
              Abadikan momen berdua walau terpisah ribuan kota.
            </p>
          </div>

          {/* Kolom Kanan: 2 Kolom Navigasi Bersih */}
          <div className="md:col-span-6 lg:col-span-5 grid grid-cols-2 gap-8 sm:gap-12">
            {/* Kolom 1: Fitur */}
            <div className="flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F1A16]">
                Fitur
              </span>
              <ul className="flex flex-col gap-2.5 text-sm text-[#757068]">
                <li>
                  <Link href="#templates" className="transition-colors hover:text-ink">
                    Koleksi Frame
                  </Link>
                </li>
                <li>
                  <Link href="#pose-coop" className="transition-colors hover:text-ink">
                    Tantangan Pose
                  </Link>
                </li>
                <li>
                  <Link href="#head-tilt" className="transition-colors hover:text-ink">
                    Head-Tilt Vibe Check
                  </Link>
                </li>
                <li>
                  <Link href="#face-mimic" className="transition-colors hover:text-ink">
                    Face Mimic
                  </Link>
                </li>
                <li>
                  <Link href="#time-capsule" className="transition-colors hover:text-ink">
                    Kapsul Waktu
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom 2: Eksplor */}
            <div className="flex flex-col gap-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F1A16]">
                Eksplor
              </span>
              <ul className="flex flex-col gap-2.5 text-sm text-[#757068]">
                <li>
                  <Link href="#playground" className="transition-colors hover:text-ink">
                    Coba Live
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="transition-colors hover:text-ink">
                    Cara Kerja
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="transition-colors hover:text-ink">
                    Pertanyaan Umum
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition-colors hover:text-ink">
                    Masuk Akun
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. Massive Brand Wordmark: "Snapmate" ala Antigravity      */}
        {/* ========================================================= */}
        <div className="my-10 sm:my-14 select-none overflow-hidden">
          <span className="block text-[19vw] sm:text-[17.5vw] font-extrabold tracking-[-0.05em] leading-[0.82] text-ink -ml-1 sm:-ml-2 transition-all">
            Snapmate
          </span>
        </div>

        {/* ========================================================= */}
        {/* 3. Bottom Utility Bar: Copyright & Legal Links            */}
        {/* ========================================================= */}
        <div className="border-t border-[#E6DFD5]/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#757068]">
          <div className="flex items-center gap-2">
            <span>© Snapmate. Dua Layar, Sejiwa.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#privacy" className="transition-colors hover:text-ink">
              Kebijakan Privasi
            </Link>
            <Link href="#terms" className="transition-colors hover:text-ink">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
