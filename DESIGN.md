---
version: 1.0.0
name: photobooth-fun-yellow-cream
description: Design system untuk Collaborative Virtual Photobooth. Memadukan kanvas bernuansa cream hangat, aksen utama Fun-Yellow (#F5A623) untuk interaktivitas dan shutter, Terracotta/Coral (#E76F51) untuk highlight hangat & kursor kolaborator, dan Mint/Teal (#38A89D) untuk status WebRTC. Karakter antarmuka playful, ramah, taktikal seperti photostrip fisik, anti-AI-slop, dan jauh dari kesan software korporat/techy yang kaku.

colors:
  primary: "#F5A623"
  primary-active: "#D98A12"
  primary-disabled: "#F5E4C4"
  on-primary: "#1F1A16"
  ink: "#1F1A16"
  body: "#3D3A35"
  body-strong: "#26221E"
  muted: "#757068"
  muted-soft: "#9C968C"
  hairline: "#E6DFD5"
  hairline-soft: "#EFECE6"
  canvas: "#FAF9F5"
  surface-soft: "#F5F0E8"
  surface-card: "#EFE9DE"
  surface-cream-strong: "#E8DFD0"
  surface-dark: "#1A1917"
  surface-dark-elevated: "#262421"
  surface-dark-soft: "#201E1B"
  on-dark: "#FAF9F5"
  on-dark-soft: "#A6A29A"
  accent-teal: "#38A89D"
  accent-coral: "#E76F51"
  success: "#48BB78"
  warning: "#F5A623"
  error: "#E53E3E"

typography:
  font-family-base: "Figtree, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  font-family-mono: "'JetBrains Mono', ui-monospace, monospace"
  display-xl:
    fontFamily: "Figtree, sans-serif"
    fontSize: 56px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: -1px
  display-lg:
    fontFamily: "Figtree, sans-serif"
    fontSize: 42px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.8px
  display-md:
    fontFamily: "Figtree, sans-serif"
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.5px
  display-sm:
    fontFamily: "Figtree, sans-serif"
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: -0.3px
  title-lg:
    fontFamily: "Figtree, sans-serif"
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.2px
  title-md:
    fontFamily: "Figtree, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  title-sm:
    fontFamily: "Figtree, sans-serif"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  body-md:
    fontFamily: "Figtree, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0
  body-sm:
    fontFamily: "Figtree, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  caption:
    fontFamily: "Figtree, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  caption-uppercase:
    fontFamily: "Figtree, sans-serif"
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 1px
  code:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: 0
  button:
    fontFamily: "Figtree, sans-serif"
    fontSize: 15px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.2px
  nav-link:
    fontFamily: "Figtree, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0

rounded:
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 80px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 14px 24px
    height: 48px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.full}"
    padding: 14px 24px
    height: 48px
    border: "1.5px solid {colors.hairline}"
  button-shutter:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 72px
    boxShadow: "0 4px 14px rgba(245, 166, 35, 0.45)"
  button-icon-circular:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 42px
  text-link:
    backgroundColor: transparent
    textColor: "{colors.accent-coral}"
    typography: "{typography.body-md}"
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-link}"
    height: 72px
  hero-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    padding: 64px 24px
  photobooth-preview-card:
    backgroundColor: "{colors.canvas}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.xl}"
    boxShadow: "0 8px 30px rgba(31, 26, 22, 0.06)"
  feature-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.title-md}"
    rounded: "{rounded.xl}"
    padding: 28px
  badge-coral:
    backgroundColor: "{colors.accent-coral}"
    textColor: "#ffffff"
    typography: "{typography.caption-uppercase}"
    rounded: "{rounded.pill}"
    padding: 6px 14px
  status-dot-teal:
    backgroundColor: "{colors.accent-teal}"
    rounded: "{rounded.full}"
    size: 10px
  footer:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark-soft}"
    typography: "{typography.body-sm}"
    padding: 64px 24px
---

## Overview

Sistem desain ini dirancang khusus untuk **Collaborative Virtual Photobooth**. Berbeda dengan software B2B atau tool AI yang kaku, dingin, dan "techy", antarmuka photobooth ini berjiwa **playful, hangat, interaktif, dan ramah (anti-AI-slop)**.

Dasar visual berakar pada **Cream Canvas** (`#FAF9F5`) yang hangat seperti kertas foto analog, dipadukan dengan **Fun-Yellow** (`#F5A623`) sebagai pemicu energi utama untuk tombol aksi dan shutter, **Terracotta / Accent Coral** (`#E76F51`) untuk aksentuasi hangat & kursor kolaborator, serta **Accent Teal** (`#38A89D`) sebagai penanda status koneksi WebRTC yang tenang dan terpercaya.

Seluruh tipografi ditenagai oleh **Figtree**—sebuah typeface sans-serif modern dengan proporsi melengkung yang bersahabat, dinamis, dan sangat nyaman dibaca baik pada judul besar (*punchy display*) maupun teks antarmuka.

---

## Token Warna & Filosofi

### 1. Brand & Aksi Utama (Fun-Yellow & Cream)
* **Primary / Fun-Yellow (`#F5A623`)**:
  * **Fungsi:** Seluruh Call-to-Action (CTA) utama, tombol shutter foto, pemicu room, dan highlight interaktif.
  * **Aksesibilitas Wajib:** **SELALU pasangkan dengan teks gelap (`#1F1A16`)**, bukan teks putih! Kombinasi Fun-Yellow dengan teks `#1F1A16` menghasilkan rasio kontras > 7:1 (lulus standar WCAG AAA).
* **Primary Active (`#D98A12`)**:
  * **Fungsi:** State *hover*, *focus*, dan *pressed* saat tombol kuning ditekan. Menghadirkan kesan kedalaman yang taktil dan mantap tanpa terkesan kusam.
* **Primary Disabled (`#F5E4C4`)**:
  * **Fungsi:** Kondisi tombol belum siap (misal kamera sedang memuat stream).

### 2. Aksen & Kolaborasi
* **Accent Coral (`#E76F51`)** *(Pengganti amber)*:
  * **Fungsi:** Badge kategori, label "HOT/BARU", garis pemandu ilusi (*cross-frame illusion ghost guides*), dan warna kursor partisipan kedua saat live doodling.
  * **Alasan:** Karena primary sudah berada di spektrum kuning hangat, warna coral/terracotta memberikan diferensiasi warna yang tegas, estetik, dan tetap harmonis di atas latar cream.
* **Accent Teal (`#38A89D`)**:
  * **Fungsi:** Indikator status jaringan WebRTC aktif, dot online partisipan, dan status latensi di bawah 150ms.
  * **Alasan:** Warna teal/mint adalah konvensi universal yang langsung dipahami pengguna sebagai "terkoneksi" tanpa menimbulkan rasa cemas atau teknis berlebihan.

### 3. Surface & Latar (Cream Paper Aesthetic)
* **Canvas (`#FAF9F5`)**: Latar lantai aplikasi utama. Hangat seperti lembaran photopaper premium. Hindari penggunaan putih murni (`#FFFFFF`) di canvas utama agar tidak silau dan tidak steril.
* **Surface Soft (`#F5F0E8`)**: Latar seksi transisi, ribbon info, dan strip pembatas.
* **Surface Card (`#EFE9DE`)**: Kartu fitur, panel opsi stiker, frame pemilih template.
* **Surface Cream Strong (`#E8DFD0`)**: Kontainer aktif atau kartu yang sedang di-highlight.
* **Hairline Border (`#E6DFD5`)**: Garis tepi tipis 1px atau 1.5px yang memberi definisi lembut pada kartu tanpa garis hitam tajam.

### 4. Permukaan Gelap (Dark Navy Product Surface)
* **Surface Dark (`#1A1917`)**: Digunakan untuk viewport viewfinder kamera saat berfoto, mode preview malam, dan footer.
* **On Dark (`#FAF9F5`)**: Teks cream di atas permukaan gelap.

### 5. Teks & Tinta
* **Ink (`#1F1A16`)**: Warna teks judul dan teks utama. Hitam hangat bersahabat, bukan `#000000` murni.
* **Body (`#3D3A35`)**: Teks paragraf dan instruksi.
* **Muted (`#757068`)**: Keterangan sekunder, timestamp, placeholder input.

---

## Tipografi: Figtree

Seluruh tingkatan hirarki teks menggunakan satu keluarga font utama: **Figtree**.

| Token | Ukuran | Bobot | Line Height | Tracking | Penggunaan Utama |
|---|---|---|---|---|---|
| `display-xl` | 56px | 800 (ExtraBold) | 1.1 | -1.0px | Headline Hero Utama ("Abadikan Momen Berdua") |
| `display-lg` | 42px | 700 (Bold) | 1.15 | -0.8px | Judul Seksi Halaman |
| `display-md` | 32px | 700 (Bold) | 1.2 | -0.5px | Sub-seksi & Judul Modal |
| `display-sm` | 24px | 700 (Bold) | 1.25 | -0.3px | Kartu Highlight & Angka Countdown (3-2-1) |
| `title-lg` | 20px | 600 (SemiBold) | 1.35 | -0.2px | Judul Fitur & Kartu Template |
| `title-md` | 18px | 600 (SemiBold) | 1.4 | 0 | Subjudul & Label Kontrol Sesi |
| `title-sm` | 16px | 600 (SemiBold) | 1.4 | 0 | Nama Partisipan & Label Input |
| `body-md` | 16px | 400 (Regular) | 1.6 | 0 | Paragraf Deskripsi & Panduan Pose |
| `body-sm` | 14px | 400 (Regular) | 1.55 | 0 | Keterangan Tambahan & Tips |
| `caption` | 13px | 600 (SemiBold) | 1.4 | 0 | Badge status, tooltip |
| `caption-uppercase` | 12px | 700 (Bold) | 1.4 | 1.0px | Tag Kategori, Label "NEW", Status Room |
| `button` | 15px | 700 (Bold) | 1.0 | 0.2px | Teks Tombol Shutter & CTA Utama |
| `code` | 14px | 500 (Medium) | 1.6 | 0 | Room Code & Tautan Berbagi (JetBrains Mono) |

---

## Radius & Bentuk (Playful & Taktil)

* **`rounded.full` (Pill / 9999px)**: Digunakan untuk seluruh tombol utama, tombol shutter kamera, pill badge, dan tab navigasi. Menghasilkan karakter bersahabat dan mudah disentuh di layar ponsel (*finger-friendly*).
* **`rounded.xl` (24px)**: Digunakan untuk kartu photostrip, viewport kamera, dan kotak dialog.
* **`rounded.lg` (16px)**: Digunakan untuk kartu fitur dan template preview.
* **`rounded.md` (12px)**: Digunakan untuk input teks dan tombol aksi sekunder.

---

## Aturan Desain (Do's and Don'ts)

### DO:
1. **Selalu gunakan teks gelap (`#1F1A16`) pada tombol Fun-Yellow (`#F5A623`)**: Jangan gunakan teks putih di atas tombol kuning karena tidak terbaca.
2. **Pertahankan latar Cream (`#FAF9F5`)**: Memberikan nuansa foto analog yang nyaman di mata, tidak seperti website korporat standar.
3. **Sentuhan Playful & Dinamis**: Tambahkan micro-interaction (scale 0.96 pada klik tombol, bounce lembut pada stiker, countdown pulsa 3-2-1).
4. **Perjelas status kolaborator**: Gunakan warna Teal (`#38A89D`) untuk indikator koneksi dan Coral (`#E76F51`) untuk kursor rekan foto.
5. **Estetika Photobooth Asli**: Tonjolkan bentuk strip foto vertikal (1x3, 1x4) dan polaroid kotak dengan frame cream/putih tebal layaknya photobooth fisik.

### DON'T:
1. **Jangan membuat tampilan techy atau seperti developer tool**: Hindari dashboard monokrom abu-abu gelap yang kaku, terminal command line, atau ikon kubus AI generik.
2. **Jangan menghasilkan "AI Slop"**: Hindari gradient ungu-neon murahan, ilustrasi 3D stock glossy melayang tanpa konteks, atau efek glassmorphism berlebihan yang mengorbankan keterbacaan.
3. **Jangan gunakan pure white (`#FFFFFF`) sebagai background halaman**: Gunakan Canvas Cream (`#FAF9F5`).
4. **Jangan gunakan font serif kaku atau font korporat**: Gunakan Figtree yang ramah, bulat, dan hidup.
