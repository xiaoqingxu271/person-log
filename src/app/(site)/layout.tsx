import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogoMark } from '@/components/logo-mark'
import { HeaderSearch } from '@/components/header-search'
import { GithubIcon, MailIcon, RssIcon } from '@/components/icons'

const nav = [
  { href: '/', label: '首页' },
  { href: '/archives', label: '归档' },
  { href: '/categories', label: '分类' },
  { href: '/tags', label: '标签' },
  { href: '/moments', label: '说说' },
  { href: '/friends', label: '友链' },
  { href: '/about', label: '关于' },
]

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const cfg = await getSiteConfig()
  // 从 GitHub 主页链接提取用户名作为创作者署名，如 https://github.com/xxx → xxx
  let creator: string | null = null
  if (cfg.githubUrl) {
    try {
      creator = new URL(cfg.githubUrl).pathname.split('/').filter(Boolean).pop() ?? null
    } catch {
      creator = null
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/80 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/80">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <LogoMark className="h-7 w-7 transition-transform group-hover:rotate-3" />
            <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-white">
              {cfg.siteName}
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-stone-600 transition-colors hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400"
              >
                {item.label}
              </Link>
            ))}
            <HeaderSearch />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="w-full flex-1">{children}</main>

      <footer className="bg-stone-900 text-stone-400 dark:bg-black">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-6 px-4 py-8 text-sm sm:flex-row">
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 text-white sm:justify-start">
              <LogoMark className="h-6 w-6" />
              <span className="font-bold tracking-tight">{cfg.siteName}</span>
            </div>
            {creator && (
              <p className="mt-1.5 text-xs text-stone-500">
                由{' '}
                <a
                  href={cfg.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-stone-400 underline-offset-2 transition-colors hover:text-white hover:underline"
                >
                  {creator}
                </a>{' '}
                创建与维护
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {cfg.githubUrl && (
              <a
                href={cfg.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-stone-500 transition-colors hover:text-white"
              >
                <GithubIcon />
              </a>
            )}
            {cfg.email && (
              <a
                href={`mailto:${cfg.email}`}
                aria-label="邮箱"
                className="text-stone-500 transition-colors hover:text-white"
              >
                <MailIcon />
              </a>
            )}
            <a
              href="/feed.xml"
              aria-label="RSS 订阅"
              className="text-stone-500 transition-colors hover:text-white"
            >
              <RssIcon />
            </a>
          </div>
        </div>
        <div className="border-t border-white/5">
          <p className="mx-auto w-full max-w-5xl px-4 py-3.5 text-center text-xs text-stone-600">
            {cfg.footerText}
          </p>
        </div>
      </footer>
    </div>
  )
}
