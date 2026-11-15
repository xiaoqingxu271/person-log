import Image from 'next/image'
import { formatCount } from '@/lib/format'
import { CloudSnowIcon, EyeIcon, FileTextIcon, FolderIcon, TagIcon } from '@/components/icons'

interface SiteHeroProps {
  tagline: string
  description: string
  bannerUrl: string
  stats: { posts: number; categories: number; tags: number; views: number }
}

/** 首页 Hero 玻璃卡：手写问候 + 站点统计 + 拍立得 + 花体标语 + 极光天气 */
export function SiteHero({ tagline, description, bannerUrl, stats }: SiteHeroProps) {
  const image = bannerUrl || '/images/aurora-lake.jpg'
  const items = [
    { label: '文章', value: String(stats.posts), icon: <FileTextIcon className="h-4 w-4" /> },
    { label: '分类', value: String(stats.categories), icon: <FolderIcon className="h-4 w-4" /> },
    { label: '标签', value: String(stats.tags), icon: <TagIcon className="h-4 w-4" /> },
    { label: '访问', value: formatCount(stats.views), icon: <EyeIcon className="h-4 w-4" /> },
  ]

  return (
    <section className="glass-panel animate-fade-up relative overflow-hidden rounded-3xl">
      <Image
        src={image}
        alt=""
        fill
        preload
        sizes="(max-width: 1280px) 100vw, 1280px"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-night-950/90 via-night-950/60 to-night-950/25"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-night-950/60 via-transparent to-night-950/30"
      />

      <div className="relative z-10 flex min-h-[212px] items-center gap-8 p-7 sm:p-9">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-ice-300/80">
            {tagline}
          </p>
          <h1 className="font-brush text-glow mt-2 text-4xl leading-tight text-white sm:text-5xl">
            你好，世界
            <span className="ml-2 inline-block origin-[70%_70%] hover:animate-[wave_1s_ease-in-out]">👋</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">{description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            {items.map((item, i) => (
              <div
                key={item.label}
                className={'flex items-center gap-2 ' + (i > 0 ? 'border-l border-white/10 pl-6' : '')}
              >
                <span className="text-ice-300/90">{item.icon}</span>
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-base font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧装饰区：拍立得 + 花体标语 + 天气 */}
        <div className="relative hidden h-[168px] w-[340px] shrink-0 lg:block xl:w-[400px]">
          <div className="absolute left-0 top-1/2 w-36 -translate-y-1/2">
            <div className="animate-float">
              <div className="rotate-[5deg] rounded-sm bg-white p-2 pb-5 shadow-[0_16px_40px_rgba(2,6,23,0.6)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.04]">
                <span className="relative block aspect-square overflow-hidden">
                  <Image src={image} alt="极光下的雪山与湖泊" fill sizes="144px" className="object-cover" />
                </span>
              </div>
            </div>
          </div>

          <p className="font-script absolute left-40 top-1 hidden -rotate-6 text-2xl font-semibold text-white/90 xl:block">
            Explore the
            <br />
            Unknown
          </p>

          <div className="glass-chip absolute right-0 top-1/2 flex w-[104px] -translate-y-1/2 flex-col items-center rounded-2xl px-3 py-3.5 text-center">
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-300">
              Aurora
            </span>
            <span className="mt-1.5 flex items-center gap-1.5">
              <CloudSnowIcon className="h-6 w-6 text-ice-300" />
              <span className="text-xl font-bold text-white">23°C</span>
            </span>
            <span className="mt-1 text-[10px] text-slate-400">Fairbanks</span>
          </div>
        </div>
      </div>
    </section>
  )
}