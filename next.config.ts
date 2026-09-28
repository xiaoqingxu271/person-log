import type { NextConfig } from "next";

// BUILD_STANDALONE=1 时输出独立运行包（Docker 镜像构建用，见 Dockerfile）；
// 本地开发 / next start 不受影响
const nextConfig: NextConfig = {
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  images: {
    // 允许优化任意 https 外链图片（文章内容仅博主本人可写，风险可控）
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
