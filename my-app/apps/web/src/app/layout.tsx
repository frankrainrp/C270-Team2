// ============================================================
// apps/web/src/app/layout.tsx
// 全局根布局 — 挂载 Google Fonts 与全局样式
// ============================================================
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Butler — 智能多模态学习管家",
  description: "AI-powered multimodal learning hub — 让学习更智能、更高效。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
