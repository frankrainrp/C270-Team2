// ============================================================
// apps/web/src/app/page.tsx
// 首页 — 展示学习管家入口，需要 Clerk 登录
// ============================================================
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  // 未登录用户跳转至登录页
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          智能多模态学习管家
        </h1>
        <p className="text-lg text-gray-600">
          上传文档，AI 自动提取 DDL 并同步至日历
        </p>
      </div>
    </main>
  );
}
