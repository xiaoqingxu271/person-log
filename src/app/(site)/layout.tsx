import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/site-config'
import { hasRecentMoment } from '@/lib/moments'
import { AuroraBackground } from '@/components/aurora-background'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const cfg = await getSiteConfig()
  const [owner, recentMoment] = await Promise.all([
    prisma.user.findFirst({ select: { displayName: true, avatarUrl: true } }).catch(() => null),
    hasRecentMoment(),
  ])

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
    <div className="relative flex min-h-screen flex-col">
      <AuroraBackground />
      <SiteHeader
        siteName={cfg.siteName}
        ownerName={owner?.displayName || cfg.siteName}
        ownerAvatar={owner?.avatarUrl || '/images/avatar.jpg'}
        hasRecentMoment={Boolean(recentMoment)}
      />
      <main className="relative z-10 w-full flex-1">{children}</main>
      <SiteFooter
        githubUrl={cfg.githubUrl}
        email={cfg.email}
        footerText={cfg.footerText}
        creator={creator}
      />
    </div>
  )
}