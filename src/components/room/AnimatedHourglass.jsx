"use client";

/**
 * AnimatedHourglass
 * Komponen ikon jam pasir beranimasi interaktif:
 * 1. Pasir di bagian atas menyusut/turun ke bawah melalui leher jam pasir.
 * 2. Aliran & butiran pasir menetes jatuh secara dinamis.
 * 3. Pasir menumpuk dan meninggi di bagian bawah hingga penuh.
 * 4. Jam pasir berputar 180 derajat secara mulus (flip) dan mengulang siklus tanpa henti (infinite seamless loop).
 * 
 * Mengikuti sistem desain Snapmate: Golden Warm Sand (#EAA824, #D98A12) dengan outline sleek ink (#1F1A16 / #757068).
 */
export function AnimatedHourglass({ className = "size-7" }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Menunggu pasangan bergabung..."
    >
      <style>{`
        @keyframes hourglass-flip {
          0%, 65% {
            transform: rotate(0deg);
          }
          80%, 100% {
            transform: rotate(180deg);
          }
        }

        @keyframes top-drain {
          0% {
            transform: scale(1, 1);
            opacity: 1;
          }
          55% {
            transform: scale(0.18, 0.05);
            opacity: 0.9;
          }
          60%, 100% {
            transform: scale(0, 0);
            opacity: 0;
          }
        }

        @keyframes bottom-fill {
          0%, 5% {
            transform: scale(0.2, 0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          58%, 100% {
            transform: scale(1, 1);
            opacity: 1;
          }
        }

        @keyframes sand-stream {
          0%, 4% {
            opacity: 0;
            stroke-dashoffset: 8;
          }
          8%, 54% {
            opacity: 1;
            stroke-dashoffset: 0;
          }
          58%, 100% {
            opacity: 0;
            stroke-dashoffset: -8;
          }
        }

        @keyframes sand-drop {
          0%, 6% {
            opacity: 0;
            transform: translateY(0);
          }
          10% {
            opacity: 1;
          }
          52% {
            opacity: 1;
            transform: translateY(8px);
          }
          56%, 100% {
            opacity: 0;
            transform: translateY(9.5px);
          }
        }

        .ah-rotator {
          transform-origin: 16px 16px;
          animation: hourglass-flip 3.8s cubic-bezier(0.68, -0.15, 0.265, 1.15) infinite;
        }

        .ah-top-sand {
          transform-origin: 16px 15.5px;
          animation: top-drain 3.8s ease-in-out infinite;
        }

        .ah-bottom-sand {
          transform-origin: 16px 25.5px;
          animation: bottom-fill 3.8s ease-in-out infinite;
        }

        .ah-stream {
          animation: sand-stream 3.8s linear infinite;
        }

        .ah-drop {
          animation: sand-drop 3.8s linear infinite;
        }
      `}</style>

      <g className="ah-rotator">
        {/* Pasir di Ruang Bawah (Menumpuk dan meninggi dari lantai dasar) */}
        <path
          d="M 11 25.5 L 21 25.5 C 20 21.5, 17.5 18.5, 16 16.5 C 14.5 18.5, 12 21.5, 11 25.5 Z"
          fill="#EAA824"
          className="ah-bottom-sand"
        />

        {/* Pasir di Ruang Atas (Menyusut dan mengalir ke leher corong) */}
        <path
          d="M 11 6.5 L 21 6.5 C 20 10.5, 17.5 13.5, 16 15.5 C 14.5 13.5, 12 10.5, 11 6.5 Z"
          fill="#EAA824"
          className="ah-top-sand"
        />

        {/* Aliran Pasir yang Menetes di Bagian Leher Jam Pasir */}
        <line
          x1="16"
          y1="14.5"
          x2="16"
          y2="25"
          stroke="#D98A12"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="2 2"
          className="ah-stream"
        />

        {/* Butiran Pasir yang Jatuh Menumpuk ke Bawah */}
        <circle
          cx="16"
          cy="15"
          r="0.8"
          fill="#D98A12"
          className="ah-drop"
        />

        {/* Dinding Kaca Jam Pasir (Sisi Kiri & Kanan Simetris) */}
        <path
          d="M 10 4.5 C 10 11, 14.5 13.5, 14.5 16 C 14.5 18.5, 10 21, 10 27.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 22 4.5 C 22 11, 17.5 13.5, 17.5 16 C 17.5 18.5, 22 21, 22 27.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Tutup Pelat Atas dan Bawah */}
        <line
          x1="8"
          y1="4.5"
          x2="24"
          y2="4.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="27.5"
          x2="24"
          y2="27.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Pantulan Cahaya Kaca Statis (Tetap di sudut kiri atas saat jam berputar) */}
      <path
        d="M 11.5 7.5 C 11 9.5, 12 11.5, 13 12.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}
