import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "에리아 게임즈 - 랜덤박스",
  description: "즐거운 랜덤박스 게임",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "에리아 게임즈",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-gray-200">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
