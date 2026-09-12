"use client";

import { Camera, Smile, Laugh, Hourglass } from "lucide-react";
import TabsUnderline from "@/components/shadcn-space/radix/tabs/tabs-underline";
import { StepCard } from "./StepCard";

export function HowItWorksSection({ onStartClick }) {
  const modes = [
    {
      id: "classic",
      label: "Sesi Foto Klasik",
      icon: Camera,
      content: (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
          <StepCard
            stepNumber="01"
            title="Bikin Room & Kirim Tautan"
            description="Buat ruang foto privat dengan satu klik, lalu bagikan tautan atau kode QR ke doi atau temanmu tanpa perlu registrasi."
          />
          <StepCard
            stepNumber="02"
            title="Pose Serempak & AI Shutter"
            description="Hitung mundur 3-2-1 berjalan serentak. Satukan separuh simbol hati dengan AI Pose Match untuk memicu shutter otomatis."
          />
          <StepCard
            stepNumber="03"
            title="Hias Bareng & Unduh"
            description="Coret-coret kuas warna-warni dan tempel stiker estetik langsung di kanvas bersama, lalu simpan hasil foto strip atau animasi GIF."
          />
        </div>
      ),
    },
    {
      id: "head-tilt",
      label: "Head-Tilt Vibe Check",
      icon: Smile,
      content: (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
          <StepCard
            stepNumber="01"
            title="Muncul Pertanyaan Pilihan"
            description="Layar menampilkan dua pilihan santai di sisi kiri dan kanan (misal: kopi vs teh) dengan hitung mundur 5 detik."
          />
          <StepCard
            stepNumber="02"
            title="Miringkan Kepala ke Jawaban"
            description="MediaPipe mendeteksi kemiringan kepalamu secara lokal, lalu menyinkronkan pilihan ke layar teman secara real-time."
          />
          <StepCard
            stepNumber="03"
            title="Jepret di Titik Puncak"
            description="Kamera otomatis mengambil foto saat kepala miring, mengevaluasi kesamaan selera kalian, dan memasukkannya ke strip foto."
          />
        </div>
      ),
    },
    {
      id: "face-mimic",
      label: "Face Mimic",
      icon: Laugh,
      content: (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
          <StepCard
            stepNumber="01"
            title="Tentukan Aktor & Penebak"
            description="Sistem secara acak menunjuk satu orang sebagai Aktor pemberi ekspresi dan satu orang sebagai Penebak."
          />
          <StepCard
            stepNumber="02"
            title="Peragakan Tanpa Suara"
            description="Aktor menerima instruksi ekspresi rahasia dan menirukannya di depan kamera secara bisu sementara rekan menebak."
          />
          <StepCard
            stepNumber="03"
            title="Tangkap Momen Tawa Lepas"
            description="Begitu tebakan benar dan tombol ditekan, rolling buffer kamera mengambil foto momen tawa paling lepas secara serentak."
          />
        </div>
      ),
    },
    {
      id: "time-capsule",
      label: "Kapsul Waktu",
      icon: Hourglass,
      content: (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 sm:gap-6">
          <StepCard
            stepNumber="01"
            title="Tentukan Tanggal Buka"
            description="Selesai berfoto dan merekam pesan suara singkat, kalian memilih tanggal buka bersama di masa depan."
          />
          <StepCard
            stepNumber="02"
            title="Kunci dengan Token Ganda"
            description="Sistem membuat dua kunci unik untuk masing-masing perangkat. Berkas foto dan rekaman suara dienkripsi dengan aman."
          />
          <StepCard
            stepNumber="03"
            title="Buka Bersama di Hari H"
            description="Pada tanggal yang telah disepakati, kedua orang membuka tautan secara serentak untuk membuka segel foto kenangan."
          />
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-16 sm:py-20 border-t border-[#E6DFD5] bg-canvas">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header - Clean, Confident, No AI Slop Eyebrows */}
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1F1A16]">
            Cara Kerja
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#757068]">
            Pilih aktivitas seru untuk berfoto bersama teman atau pasangan jarak jauh.
          </p>
        </div>

        {/* Animated Underline Tabs */}
        <TabsUnderline tabs={modes} />
      </div>
    </section>
  );
}
