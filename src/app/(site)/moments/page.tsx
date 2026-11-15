import { readFile } from 'fs/promises'
import path from 'path'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { listMoments } from '@/lib/moments'
import { listTagsWithCount } from '@/lib/posts'
import { getSiteConfig } from '@/lib/site-config'
import { getSessionUser } from '@/lib/session'
import { getBlogStats } from '@/lib/stats'
import { formatCount } from '@/lib/format'
import { MomentCard } from '@/components/moment-card'
import { MomentComposer } from '@/components/moment-composer'
import { WeatherCard } from '@/components/weather-card'
import { MountainLine } from '@/components/mountain-line'
import { StarConstellation } from '@/components/star-constellation'
import { SparkleIcon, TagIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '说说' }

/** 取 about.md 的首段正文作为 profile 简介 */
async function loadBio(fallback: string): Promise<string> {
  try {
    const md = await readFile(path.join(process.cwd(), 'content', 'about.md'), 'utf8')
    const paragraph = md
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find((block) => block && !block.startsWith('#') && !block.startsWith('>'))
    return paragraph ? paragraph.replace(/[*`]/g, '').slice(0, 120) : fallback
  } catch {
    return fallback
  }
}

export default async function MomentsPage() {
  const [moments, cfg, user, owner, stats, tags] = await Promise.all([
    listMoments(),
    getSiteConfig(),
    getSessionUser(),
    prisma.user.findFirst({ select: { displayName: true, avatarUrl: true } }).catch(() => null),
    getBlogStats(),
    listTagsWithCount(),
  ])
  const ownerName = owner?.displayName || cfg.siteName
  const ownerAvatar = owner?.avatarUrl || '/images/avatar.jpg'
  const bio = await loadBio(cfg.description)
  const hobbies = [...tags].sort((a, b) => b._count.posts - a._count.posts).slice(0, 4)

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 py-8 sm:px-4">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_300px]">
        {/* 左：博主 profile */}
        <aside className="glass-panel animate-fade-up self-start rounded-3xl p-6 text-center lg:sticky lg:top-24">
          <div className="relative mx-auto h-28 w-28">
            <span aria-hidden className="absolute inset-0 rounded-full bg-gradient-to-br from-aurora-400 via-ice-400 to-flare-400 opacity-80 blur-[7px]" />
            <Image
              src={ownerAvatar}
              alt={`${ownerName}的头像`}
              width={112}
              height={112}
              className="relative h-28 w-28 rounded-full border-2 border-night-900 object-cover"
            />
            <SparkleIcon className="absolute -right-1 top-3 h-3 w-3 text-flare-300" />
            <SparkleIcon className="absolute -left-2 bottom-6 h-2.5 w-2.5 text-ice-200" />
          </div>
          <h1 className="font-serif-cn mt-4 text-xl font-bold text-white">{ownerName}</h1>
          <p className="font-script mt-1 text-sm text-slate-400">{cfg.siteName}</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">{cfg.description} ✨</p>

          <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-3">
            {[
              { value: stats.posts, label: '文章' },
              { value: stats.comments, label: '评论' },
              { value: stats.likes, label: '获赞' },
            ].map((item) => (
              <div key={item.label} className="px-1">
                <p className="text-base font-bold text-white">{formatCount(item.value)}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 text-left">
            <h2 className="text-sm font-semibold text-white">关于我</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {hobbies.map((tag) => (
                <span
                  key={tag.id}
                  className="glass-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-slate-300"
                >
                  <TagIcon className="h-3 w-3 text-ice-300" />
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
          <MountainLine className="mt-5 h-16 w-full opacity-80" />
        </aside>

        {/* 中：说说 feed */}
        <section className="min-w-0">
          <header className="mb-5">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              说说动态
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-ice-300" fill="currentColor" aria-hidden>
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
              </svg>
            </h2>
            <p className="font-script mt-1 text-lg text-slate-400">Thoughts &amp; Moments</p>
          </header>

          {moments.length === 0 ? (
            <div className="glass-panel rounded-2xl py-16 text-center text-sm text-slate-400">
              还没有发布过说说。
            </div>
          ) : (
            <div className="space-y-5">
              {moments.map((moment) => (
                <MomentCard
                  key={moment.id}
                  moment={{
                    id: moment.id,
                    content: moment.content,
                    imageUrl: moment.imageUrl,
                    likes: moment.likes,
                    createdAtISO: moment.createdAt.toISOString(),
                  }}
                  ownerName={ownerName}
                  ownerAvatar={ownerAvatar}
                  siteName={cfg.siteName}
                />
              ))}
            </div>
          )}

          <div className="mt-6">
            <MomentComposer loggedIn={Boolean(user)} />
          </div>
        </section>

        {/* 右：天气 + 海报 + 星座 */}
        <aside className="hidden space-y-6 self-start xl:block">
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <WeatherCard />
          </div>
          <div className="glass-panel animate-fade-up overflow-hidden rounded-2xl" style={{ animationDelay: '160ms' }}>
            <div className="relative h-44">
              <Image src="/images/aurora-cabin.jpg" alt="极光下的小木屋" fill sizes="300px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-900/80 via-night-900/20 to-transparent" />
              <div className="absolute inset-x-0 top-6 text-center">
                <p className="font-brush text-glow text-3xl text-white">追逐极光</p>
                <p className="font-script mt-1 text-sm text-ice-200">Chasing Northern Lights</p>
              </div>
            </div>
            <p className="px-4 py-3 text-center text-xs text-slate-300">下一站：更美的风景</p>
          </div>
          <StarConstellation className="h-24 w-full opacity-80" />
        </aside>
      </div>
    </div>
  )
}