import type { Metadata } from 'next'
import { SITE } from '@/lib/site'
import { getSiteConfig } from '@/lib/site-config'
import './globals.css'
import './hljs-dark.css'
import 'highlight.js/styles/github.css'

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getSiteConfig()
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${cfg.siteName} · ${cfg.tagline}`,
      template: `%s · ${cfg.siteName}`,
    },
    description: cfg.description,
    alternates: {
      types: { 'application/rss+xml': '/feed.xml' },
    },
  }
}

// 首屏渲染前设置主题，避免暗色模式闪烁（FOUC）
const themeScript = `(function(){try{var t=localStorage.getItem('personlog_theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var c=document.documentElement.classList;d?c.add('dark'):c.remove('dark')}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-stone-50 text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-200">
        {children}
      </body>
    </html>
  )
}
