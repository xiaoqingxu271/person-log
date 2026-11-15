import { listCategoriesWithMeta } from '@/lib/posts'
import { getBlogStats } from '@/lib/stats'
import { getSiteConfig } from '@/lib/site-config'
import { CategoryCard } from '@/components/category-card'
import { FileTextIcon, FolderIcon, TagIcon, CalendarIcon, HeartIcon, SparkleIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '分类' }

export default async function CategoriesPage() {
  const [categories, stats, cfg] = await Promise.all([
    listCategoriesWithMeta(),
    getBlogStats(),
    getSiteConfig(),
  ])

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 py-10 sm:px-4">
      {/* 英雄区 + 统计 + 引用 */}
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <header className="animate-fade-up">
          <h1 className="font-serif-cn text-frost text-glow text-5xl font-bold leading-tight sm:text-6xl">
            探索世界的
            <br />
            万千思绪
          </h1>
          <svg viewBox="0 0 120 16" className="mt-4 h-4 w-28" fill="none" aria-hidden>
            <path d="M4 10c14-8 22 6 36-2s22 6 36-2 22 6 40-2" stroke="url(#cat-wave)" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="cat-wave" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#34d399" />
                <stop offset="0.5" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          <p className="mt-5 text-lg tracking-[0.2em] text-slate-200">记录 · 分享 · 成长</p>
          <div className="mt-5 flex items-center gap-4 text-slate-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ice-300" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="12" cy="12" r="6" />
              <ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-18 12 12)" />
            </svg>
            <span aria-hidden className="h-1 w-1 rounded-full bg-slate-600" />
            <HeartIcon className="h-5 w-5 text-flare-300" />
            <span aria-hidden className="h-1 w-1 rounded-full bg-slate-600" />
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-aurora-300" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10ZM2 21c0-3 1.9-5.5 5-6" />
            </svg>
          </div>
        </header>

        <div className="animate-fade-up flex flex-col gap-5" style={{ animationDelay: '100ms' }}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: FileTextIcon, value: stats.posts, label: '文章总数', color: 'text-aurora-300' },
              { icon: FolderIcon, value: stats.categories, label: '分类', color: 'text-ice-300' },
              { icon: TagIcon, value: stats.tags, label: '标签', color: 'text-nebula-300' },
              { icon: CalendarIcon, value: stats.writingDays, label: '写作天数', color: 'text-flare-300' },
            ].map((item) => (
              <div key={item.label} className="text-center sm:text-left">
                <p className={`flex items-center justify-center gap-2 text-2xl font-bold text-white sm:justify-start ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                  <span className="text-white">{item.value}</span>
                </p>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 sm:justify-start">
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          <blockquote className="glass-panel relative self-end rounded-2xl px-6 py-5 text-sm leading-relaxed text-slate-200 lg:max-w-xs">
            <span aria-hidden className="font-serif-cn absolute left-4 top-2 text-2xl text-ice-400">“</span>
            <p className="pl-4">分类是思想的书架，也是生活的索引。</p>
            <footer className="mt-2 text-right text-xs text-slate-400">— {cfg.siteName}</footer>
          </blockquote>
        </div>
      </div>

      {/* 分类卡片网格 */}
      {categories.length === 0 ? (
        <div className="glass-panel mt-10 rounded-2xl py-16 text-center text-sm text-slate-400">还没有分类。</div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((cat, index) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              slug={cat.slug}
              description={cat.description}
              count={cat._count.posts}
              index={index}
              topTags={cat.topTags}
            />
          ))}
        </div>
      )}

      {/* 底部三特性 bar */}
      <div className="glass-bar mt-10 grid gap-6 rounded-2xl px-8 py-6 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
        {[
          {
            title: '原创内容',
            desc: '专注分享优质内容',
            color: 'text-ice-300',
            icon: (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
            ),
          },
          {
            title: '持续更新',
            desc: '每周更新多篇文章',
            color: 'text-nebula-300',
            icon: (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            ),
          },
          {
            title: '与你一起成长',
            desc: '感谢每一位读者的支持',
            color: 'text-aurora-300',
            icon: <HeartIcon className="h-6 w-6" filled />,
          },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-4 sm:justify-center">
            <span className={item.color}>{item.icon}</span>
            <span>
              <span className="block text-base font-bold text-white">{item.title}</span>
              <span className="mt-0.5 block text-xs text-slate-400">{item.desc}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
        <SparkleIcon className="h-3 w-3 text-nebula-400" />
        思想有书架，生活有索引
        <SparkleIcon className="h-3 w-3 text-nebula-400" />
      </p>
    </div>
  )
}