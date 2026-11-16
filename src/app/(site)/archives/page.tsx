import Link from 'next/link'
import Image from 'next/image'
import { listArchivePosts, getRecentPosts, listTagsWithCount } from '@/lib/posts'
import { getBlogStats } from '@/lib/stats'
import { formatDate } from '@/lib/format'
import { ArrowRightIcon, DownloadIcon, FileTextIcon, FolderIcon, TagIcon, HeartIcon } from '@/components/icons'
import { Reveal } from '@/components/reveal'

export const dynamic = 'force-dynamic'

export const metadata = { title: '归档' }

const MONTH_EN = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

interface ArchivePost {
  title: string
  slug: string
  publishedAt: Date | null
  summary: string
  coverUrl: string
  likes: number
  tags: { tag: { name: string; slug: string } }[]
}

function groupByYearMonth(posts: ArchivePost[]) {
  const years = new Map<number, Map<number, ArchivePost[]>>()
  for (const post of posts) {
    const d = post.publishedAt ?? new Date(0)
    const year = d.getFullYear()
    const month = d.getMonth()
    if (!years.has(year)) years.set(year, new Map())
    const months = years.get(year)!
    if (!months.has(month)) months.set(month, [])
    months.get(month)!.push(post)
  }
  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: [...months.entries()].sort((a, b) => b[0] - a[0]),
    }))
}

export default async function ArchivesPage() {
  const [posts, stats, recent, tags] = await Promise.all([
    listArchivePosts(),
    getBlogStats(),
    getRecentPosts(4),
    listTagsWithCount(),
  ])
  const groups = groupByYearMonth(posts)
  const hotTags = [...tags].sort((a, b) => b._count.posts - a._count.posts).slice(0, 8)

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 py-8 sm:px-4">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          {/* 头卡 */}
          <header className="glass-panel animate-fade-up relative flex items-center justify-between gap-6 overflow-hidden rounded-2xl p-6 sm:p-7">
            <div>
              <h1 className="font-serif-cn text-glow text-3xl font-bold text-white">归档时光</h1>
              <p className="font-script mt-1 text-xl text-slate-400">Archive</p>
              <p className="mt-2 text-xs text-slate-400">记录思考，沉淀成长，遇见更大的世界。</p>
            </div>
            <div className="hidden items-center gap-5 sm:flex">
              <p className="font-serif-cn text-right text-2xl italic leading-snug text-slate-600">
                PERSON LOG
                <br />
                Explore a Brighter You
              </p>
              <a
                href="/feed.xml"
                title="订阅 RSS"
                className="glass-chip flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:border-ice-400/40 hover:text-ice-300"
              >
                <DownloadIcon className="h-5 w-5" />
              </a>
            </div>
          </header>

          {/* 年份时间线 */}
          {groups.length === 0 ? (
            <div className="glass-panel mt-6 rounded-2xl py-16 text-center text-sm text-slate-400">还没有文章。</div>
          ) : (
            <div className="mt-8 space-y-12">
              {groups.map((group, gi) => (
                <section key={group.year} className="grid grid-cols-[auto_minmax(0,1fr)] gap-5 sm:gap-8">
                  <h2
                    className={
                      'font-serif-cn text-glow pt-1 text-5xl font-bold sm:text-6xl ' +
                      (gi % 2 === 0 ? 'text-frost' : 'aurora-text')
                    }
                  >
                    {group.year}
                  </h2>
                  <div className="relative space-y-5 pl-7 sm:pl-9">
                    <span
                      aria-hidden
                      className={
                        'absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-gradient-to-b ' +
                        (gi % 2 === 0 ? 'from-aurora-400 to-ice-500' : 'from-nebula-400 to-flare-400')
                      }
                    />
                    {group.months.map(([month, monthPosts]) => (
                      <div key={month} className="relative space-y-4">
                        <span
                          aria-hidden
                          className={
                            'absolute -left-7 top-9 h-2.5 w-2.5 rounded-full sm:-left-9 ' +
                            (gi % 2 === 0
                              ? 'bg-ice-300 shadow-[0_0_10px_rgba(125,211,252,0.9)]'
                              : 'bg-nebula-300 shadow-[0_0_10px_rgba(196,181,253,0.9)]')
                          }
                        />
                        {monthPosts.map((post, pi) => (
                          <Reveal key={post.slug} delay={pi * 70}>
                          <article
                            className="glass-panel group flex gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ice-400/30"
                          >
                            <div className="w-11 shrink-0 text-center">
                              <p className="text-2xl font-bold text-white">
                                {String(month + 1).padStart(2, '0')}
                              </p>
                              <p className="mt-0.5 text-[10px] tracking-[0.2em] text-slate-500">
                                {MONTH_EN[month]}
                              </p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-aurora-300">
                                <Link href={`/posts/${post.slug}`}>{post.title}</Link>
                              </h3>
                              {post.summary && (
                                <p className="mt-1 line-clamp-1 text-xs text-slate-400">{post.summary}</p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {post.tags.slice(0, 3).map(({ tag }) => (
                                  <Link
                                    key={tag.slug}
                                    href={`/tags/${encodeURIComponent(tag.slug)}`}
                                    className="glass-chip rounded-full px-2 py-0.5 text-[11px] text-slate-400 transition-colors hover:text-nebula-300"
                                  >
                                    {tag.name}
                                  </Link>
                                ))}
                              </div>
                            </div>
                            <Link
                              href={`/posts/${post.slug}`}
                              className="relative block h-16 w-28 shrink-0 overflow-hidden rounded-lg border border-white/10"
                              aria-label={post.title}
                            >
                              <Image
                                src={post.coverUrl || '/images/aurora-lake.jpg'}
                                alt=""
                                fill
                                sizes="112px"
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <span className="glass-chip absolute right-1 top-1 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] text-slate-100">
                                <HeartIcon className="h-2.5 w-2.5" filled />
                                {post.likes}
                              </span>
                            </Link>
                          </article>
                          </Reveal>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>

        {/* 右栏 */}
        <aside className="space-y-6 self-start">
          <section className="glass-panel animate-fade-up rounded-2xl p-6" style={{ animationDelay: '80ms' }}>
            <h2 className="font-serif-cn text-lg font-bold text-white">站点统计</h2>
            <p className="font-script text-sm text-slate-400">Statistics</p>
            <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 text-center">
              {[
                { icon: FileTextIcon, value: stats.posts, label: '篇文章', color: 'text-aurora-300' },
                { icon: FolderIcon, value: stats.categories, label: '个分类', color: 'text-nebula-300' },
                { icon: TagIcon, value: stats.tags, label: '个标签', color: 'text-flare-300' },
              ].map((item) => (
                <div key={item.label} className="px-1">
                  <item.icon className={`mx-auto h-5 w-5 ${item.color}`} />
                  <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">近期文章</h3>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-ice-300"
                >
                  查看更多
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
              <ul className="mt-3 space-y-3">
                {recent.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/posts/${post.slug}`} className="group block">
                      <p className="line-clamp-1 text-sm text-slate-200 transition-colors group-hover:text-aurora-300">
                        {post.title}
                      </p>
                      <p className="mt-0.5 flex items-center justify-between text-xs text-slate-500">
                        {post.publishedAt && (
                          <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <HeartIcon className="h-3 w-3" />
                          {post.likes}
                        </span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-white">热门标签</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {hotTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${encodeURIComponent(tag.slug)}`}
                    className="glass-chip rounded-full px-3 py-1 text-xs text-slate-300 transition-colors hover:border-nebula-400/40 hover:text-nebula-300"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-panel animate-fade-up relative overflow-hidden rounded-2xl" style={{ animationDelay: '160ms' }}>
            <div className="relative h-44">
              <Image src="/images/aurora-lake.jpg" alt="极光湖景" fill sizes="320px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-night-900/85 via-night-900/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-4 text-center">
                <p className="font-brush text-glow text-xl text-white">记录，是为了更好地出发。</p>
                <p className="font-script mt-1 text-base text-ice-200">Keep Writing</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}