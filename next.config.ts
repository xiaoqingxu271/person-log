import type { NextConfig } from "next";

// BUILD_STANDALONE=1 时输出独立运行包（Docker 镜像构建用，见 Dockerfile）；
// 本地开发 / next start 不受影响
const isDev = process.env.NODE_ENV !== "production";
const isHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

const csp = [
  "default-src 'self'",
  // Next 的启动脚本是内联的；开发模式还需要 eval 驱动 React Refresh
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  // 本地天气组件需要访问 IP 定位 / 逆地理 / open-meteo（均为免密钥公开接口）；
  // bigdatacloud 会 307 到 api-bdc.io，两个域名都要放行
  `connect-src 'self' https://ipwho.is https://ipinfo.io https://get.geojs.io https://api.bigdatacloud.net https://api-bdc.io https://api.open-meteo.com${isDev ? " ws: http: https:" : ""}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  ...(process.env.BUILD_STANDALONE === "1"
    ? {
        output: "standalone" as const,
        // Prisma 查询引擎是运行期动态加载的，显式打进 standalone，避免容器里缺 .node 文件
        outputFileTracingIncludes: {
          "/*": ["./node_modules/.prisma/client/**/*"],
        },
      }
    : {}),
  images: {
    // 允许优化任意 https 外链图片（文章内容仅博主本人可写，风险可控）
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // AVIF 比 WebP 再小约 20%；上传文件名为随机哈希，可放心长缓存
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            // 天气卡片可申请浏览器精确定位（IP 定位仅为回退）
            value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
          },
          ...(isHttps
            ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]
            : []),
        ],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/unsubscribe/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/subscribe/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
