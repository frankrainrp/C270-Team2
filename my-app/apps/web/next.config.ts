import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 启用 App Router（Next.js 14 默认已开启）
  experimental: {
    // 服务端组件可直接调用 AI SDK
    serverComponentsExternalPackages: ["@ai-sdk/openai"],
  },
};

export default nextConfig;
