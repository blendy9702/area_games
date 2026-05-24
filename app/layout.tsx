import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AREA GAMES - 랜덤박스",
  description: "친구들과 함께하는 랜덤박스 게임",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AREA GAMES",
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
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
