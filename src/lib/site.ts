export const SITE = {
  name: 'Person Log',
  tagline: '记录与思考',
  description: '个人博客：技术笔记与生活记录。',
  // 站点对外地址：部署时通过 NEXT_PUBLIC_SITE_URL 环境变量设置正式域名，
  // 影响 RSS、sitemap、JSON-LD、Open Graph 中的链接
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  postsPerPage: 10,
}
