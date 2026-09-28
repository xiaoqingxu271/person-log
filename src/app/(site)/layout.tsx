import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { ThemeToggle } from '@/components/theme-toggle'

const nav = [
  { href: '/', label: '首页' },
  { href: '/archives', label: '归档' },
  { href: '/categories', label: '分类' },
  { href: '/tags', label: '标签' },
  { href: '/search', label: '搜索' },
  { href: '/about', label: '关于' },
]

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const cfg = await getSiteConfig()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between gap-4 px-4">
          <Link href="/" className="shrink-0 text-lg font-bold">
            {cfg.siteName}
          </Link>
          <nav className="flex items-center gap-4 text-sm sm:gap-5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                {item.label}
              </Link>
            ))}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-4 px-4 py-6 text-sm text-neutral-500 dark:text-neutral-400">
          <span>{cfg.footerText || `© ${new Date().getFullYear()} ${cfg.siteName}`}</span>
          {cfg.githubUrl && (
            <a
              href={cfg.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              GitHub
            </a>
          )}
          {cfg.email && (
            <a
              href={`mailto:${cfg.email}`}
              className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              邮箱
            </a>
          )}
          <a
            href="/feed.xml"
            className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            RSS
          </a>
        </div>
      </footer>
    </div>
  )
}
