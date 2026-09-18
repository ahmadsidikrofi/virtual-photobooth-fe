# 📸 Snapmate — Virtual Photobooth Studio

> **Abadikan momen berharga bersama pasangan LDR, sahabat, atau keluarga secara real-time dalam format photostrip berkualitas tinggi.**

---

## 🌟 Tentang Proyek

**Snapmate** adalah platform *virtual photobooth* kolaboratif berbasis web yang memungkinkan dua orang atau lebih berfoto bersama dari jarak jauh seolah-olah sedang berada di dalam bilik foto (*photobooth*) yang sama. 

Snapmate menghadirkan pengalaman bilik foto yang interaktif dan personal: mulai dari sinkronisasi pose kamera real-time, hitung mundur otomatis, ragam pilihan grid & tema bingkai artisanal, hingga ekspor strip foto cetak beresolusi tinggi (300 DPI).

---

## ✨ Fitur Utama

- 👥 **Real-Time Synchronized Booth (WebRTC / PeerJS)**
  - Koneksi peer-to-peer instan antar ruangan dengan latensi minimal.
  - Sinkronisasi timer hitung mundur (*countdown*), tombol *shutter*, dan pergantian giliran foto secara otomatis.
- 📐 **Format Grid Fleksibel**
  - **Strip 1×4** (Format strip vertikal klasik 4 foto).
  - **Strip 1×3** (Format vertikal editorial 3 foto).
  - **Grid 2×2** (Format kotak modern 4 foto).
  - **Grid 1×2** & **Wide 2×2** untuk kebutuhan potret pasangan atau grup.
- 🎨 **Koleksi Bingkai Eksklusif & Artisanal**
  - **4 Tema Dinamis Utama:** *Pure Minimalist*, *Daily News Editorial*, *Distance Thread*, dan *35mm Vintage Filmstrip*.
  - **Edisi Koleksi Spesifik Grid:** *Polaroid Chin*, *Airmail Postcard*, *Retro Seluloid*, hingga *Full-page Vintage Newspaper*.
- 🪞 **Kamera Studio & Efek Lokal**
  - Flip cermin (*camera mirror toggle*) terakselerasi hardware.
  - Simulasi *studio flash*, *countdown audio beep*, dan retake slot perorangan.
- 🖨️ **High-DPI Canvas Rendering (300 DPI)**
  - Hasil jepretan di-render langsung di sisi klien menggunakan HTML5 Canvas beresolusi cetak tajam tanpa kompresi buram.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack) & [React 19](https://react.dev/)
- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **State Management:** [Zustand v5](https://github.com/pmndrs/zustand) (Modular persistent store)
- **Real-Time Networking:** [PeerJS](https://peerjs.com/) & WebRTC (DataChannel, MediaStream)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/), [Motion v13](https://motion.dev/), [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/)
- **Media & Graphics Engine:** Native WebRTC `getUserMedia`, MediaStream API, & HTML5 Canvas 2D Context (High-DPI 300 DPI)

---

## 🚀 Memulai (Getting Started)

### 1. Prasyarat
Pastikan kamu telah menginstal:
- [Node.js](https://nodejs.org/) (v18+) atau [Bun](https://bun.sh/) (Disarankan)

### 2. Instalasi Dependensi
```bash
# Menggunakan Bun
bun install

# Atau menggunakan NPM
npm install
```

### 3. Konfigurasi Environment
Buat file `.env.local` di root proyek (opsional untuk custom signaling server):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# NEXT_PUBLIC_PEERJS_HOST=peerjs.92ki.biz
# NEXT_PUBLIC_PEERJS_PORT=443
```

### 4. Menjalankan Server Development
```bash
bun run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser kamu.

---

## 🗺️ Roadmap Fitur Mendatang (PRD V2.0)

### Milestone 2: Interaktivitas & Kolaborasi Real-Time
- [ ] **Multiplayer Live Doodling:** Kanvas dekorasi bersama pasca-foto dengan *Multi-Cursor Tracking* tersinkronisasi via WebRTC Data Channels.
- [ ] **Touchless Gesture Shutter:** Pemicu hitung mundur tanpa sentuh (gestur *Open Palm* / *Peace Sign*) berbasis Computer Vision.
- [ ] **Pose Roulette:** Tantangan gaya pose acak 3 detik sebelum shutter aktif.
- [ ] **Blind / Surprise Mode:** Mode kejutan dengan preview kamera rekan disamarkan (*blur*) hingga seluruh jepretan selesai.
- [ ] **Cross-Frame Illusion Guides:** Template tata letak dengan panduan transparan (*ghost guides*) menghubungkan dua bingkai foto berdampingan.

### Milestone 3: AI Co-op & Format Output Dinamis
- [ ] **AI Co-op Pose Matching:** Deteksi pose tubuh berbasis MediaPipe Pose di browser (validasi siluet hati menyatu antar-partisipan sebelum shutter otomatis terpicu).
- [ ] **Animated GIF Strip:** Kompilasi seluruh jepretan multi-shot menjadi animasi gerak looping (2–3 detik).
- [ ] **Interactive Live Photo + Voice Note:** Perekaman audio mikrofon 2–3 detik saat shutter dengan playback interaktif di web viewer.
- [ ] **Instant QR Code Cloud Sharing:** Unggah instan ke ephemeral cloud storage (auto-delete 24 jam) untuk scan dan unduh langsung via smartphone.
- [ ] **Dynamic Ambient Tone Matching:** Penyelarasan otomatis suhu warna pencahayaan antar dua ruangan kamera.

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE).
