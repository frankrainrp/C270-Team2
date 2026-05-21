// ============================================================
// apps/web/src/app/layout.tsx
// 全局根布局 — 挂载 Clerk Provider 与全局样式
// ============================================================
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "智能多模态学习管家",
  description: "AI-powered multimodal learning hub for universities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {/* Clerk Provider 包裹全局，所有页面共享登录状态 */}
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
