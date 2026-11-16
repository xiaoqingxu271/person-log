import type { Metadata } from 'next'
import { Ma_Shan_Zheng, Dancing_Script, Playfair_Display } from 'next/font/google'
import { SITE } from '@/lib/site'
import { getSiteConfig } from '@/lib/site-config'
import './globals.css'
import './hljs-dark.css'
import 'highlight.js/styles/github.css'

// 中文手写体（Hero 问候 / 极光之语）
const brush = Ma_Shan_Zheng({
  subsets: ['latin'],
  weight: '400',
  preload: false,
  variable: '--font-brush',
})

// 英文花体（Explore the Unknown / Keep Learning）
const script = Dancing_Script({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-script',
})

// 衬线展示体（Logo / 英文引文）
const display = Playfair_Display({
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

export async function generateMetadata(): Promise<Metadata> {
  const cfg = await getSiteConfig()
  const title = `${cfg.siteName} · ${cfg.tagline}`
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: title,
      template: `%s · ${cfg.siteName}`,
    },
    description: cfg.description,
    alternates: {
      types: { 'application/rss+xml': '/feed.xml' },
    },
    openGraph: {
      type: 'website',
      siteName: cfg.siteName,
      title,
      description: cfg.description,
      images: [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: cfg.siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      images: ['/images/og-default.jpg'],
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`dark ${brush.variable} ${script.variable} ${display.variable}`}>
      <body className="bg-night-950 text-slate-200 antialiased">{children}</body>
    </html>
  )
}