import { Figtree } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Snapmate - Dua Layar, Sejiwa",
  description: "Virtual photobooth real-time untuk pasangan LDR, sahabat, dan bestie. Dua layar, sejiwa.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${figtree.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
