import Link from 'next/link'
import { SubscribeForm } from '@/components/subscribe-form'
import { GithubIcon, MailIcon, RssIcon, SparkleIcon } from '@/components/icons'

interface SiteFooterProps {
  githubUrl: string
  email: string
  footerText: string
  creator: string | null
  icpNumber: string
  icpUrl: string
}

/** 订阅玻璃栏 + 社交链接 + Keep Learning 花体署名 */
export function SiteFooter({ githubUrl, email, footerText, creator, icpNumber, icpUrl }: SiteFooterProps) {
  const socials = [
    githubUrl && { href: githubUrl, label: 'GitHub', icon: <GithubIcon />, external: true },
    email && { href: `mailto:${email}`, label: '邮箱', icon: <MailIcon />, external: false },
    { href: '/feed.xml', label: 'RSS', icon: <RssIcon />, external: false },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode; external: boolean }[]

  return (
    <footer className="relative z-10 px-3 pb-6 pt-2 sm:px-4">
      <div className="glass-bar mx-auto w-full max-w-[1280px] rounded-3xl px-6 py-6 sm:px-8">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-8">
          <div className="flex shrink-0 items-center gap-4">
            <span className="glass-chip flex h-12 w-12 items-center justify-center rounded-full text-ice-300 shadow-[0_0_18px_rgba(56,189,248,0.25)]">
              <MailIcon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-bold text-white">订阅我的博客</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                留下邮箱，加入新文章更新通知列表。
              </span>
            </span>
          </div>

          <div className="flex w-full flex-1 justify-center">
            <SubscribeForm />
          </div>

          <div className="flex shrink-0 items-center gap-6">
            <div className="flex items-center gap-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  {...(s.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group flex flex-col items-center gap-1 text-slate-400 transition-colors hover:text-white"
                >
                  <span className="transition-transform group-hover:-translate-y-0.5">{s.icon}</span>
                  <span className="text-[10px] tracking-wide">{s.label}</span>
                </a>
              ))}
            </div>
            <span className="font-script aurora-text hidden -rotate-3 items-center gap-1.5 text-2xl font-semibold xl:flex">
              Keep Learning
              <SparkleIcon className="h-4 w-4 text-flare-300" />
            </span>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        {footerText}
        {creator && (
          <>
            {' · 由 '}
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 underline-offset-2 transition-colors hover:text-ice-300 hover:underline"
            >
              {creator}
            </a>{' '}
            创建与维护
          </>
        )}
        {icpNumber && (
          <>
            {' · '}
            <a
              href={icpUrl || 'https://beian.miit.gov.cn/'}
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 underline-offset-2 transition-colors hover:text-ice-300 hover:underline"
            >
              {icpNumber}
            </a>
          </>
        )}
        {' · '}
        <Link
          href="/privacy"
          className="text-slate-400 underline-offset-2 transition-colors hover:text-ice-300 hover:underline"
        >
          隐私政策
        </Link>
      </p>
    </footer>
  )
}