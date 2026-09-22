"use client";

import { HandMetal, PawPrint, HandHeart, Hand } from "lucide-react";

/**
 * VictoryHandIcon
 * Icon vektor bergaya Lucide untuk gestur Victory / Peace (✌️)
 */
export function VictoryHandIcon({ className = "size-5", strokeWidth = 2.2, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M10 10.5V4a2 2 0 1 0-4 0v9" />
      <path d="M14 10.5V3a2 2 0 1 0-4 0v7" />
      <path d="M14 11.5a2 2 0 0 1 4 0v2a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-2a2 2 0 1 1 4 0v1.5" />
      <path d="M7 14.5a2 2 0 0 0 3.5 0" />
    </svg>
  );
}

/**
 * GestureIcon
 * Menampilkan ikon vektor profesional (Lucide style) berdasarkan kategori gestur:
 * - Victory: VictoryHandIcon (Peace)
 * - ILoveYou: HandMetal (🤟 I Love You)
 * - CatPaw: PawPrint (🐾 Cakar Kucing)
 * - HalfHeart: HandHeart (🫶 Half Heart)
 */
export function GestureIcon({ category, className = "size-5", strokeWidth = 2.2, ...props }) {
  switch (category) {
    case "Victory":
      return <VictoryHandIcon className={className} strokeWidth={strokeWidth} {...props} />;
    case "ILoveYou":
      return <HandMetal className={className} strokeWidth={strokeWidth} {...props} />;
    case "CatPaw":
      return <PawPrint className={className} strokeWidth={strokeWidth} {...props} />;
    case "HalfHeart":
      return <HandHeart className={className} strokeWidth={strokeWidth} {...props} />;
    default:
      return <Hand className={className} strokeWidth={strokeWidth} {...props} />;
  }
}
