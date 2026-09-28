import { ChevronDownIcon } from '@/components/icons'

interface SiteHeroProps {
  siteName: string
  tagline: string
  description: string
  bannerUrl: string
  stats: { posts: number; categories: number; tags: number }
}

/**
 * 首页全宽照片横幅（慵懒风）：默认使用内置照片，可在后台设置里换成自己的图。
 * 压暗遮罩保证文字可读；统计信息用玻璃拟态胶囊；无多余装饰曲线。
 */
export function SiteHero({ siteName, tagline, description, bannerUrl, stats }: SiteHeroProps) {
  const image = bannerUrl || '/images/hero-default.jpg'

  return (
    <section className="relative">
      <div className="relative flex min-h-[74vh] items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60"
        />

        <div className="relative z-10 mx-auto w-full max-w-4xl px-4 py-28 text-center text-white">
          <p className="animate-fade-up text-xs font-medium uppercase tracking-[0.4em] text-white/75">
            {tagline}
          </p>
          <h1
            className="animate-fade-up mt-5 text-5xl font-semibold tracking-tight drop-shadow-sm sm:text-7xl"
            style={{ animationDelay: '80ms' }}
          >
            {siteName}
          </h1>
          <p
            className="animate-fade-up mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base"
            style={{ animationDelay: '160ms' }}
          >
            {description}
          </p>
          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: '240ms' }}
          >
            {[`${stats.posts} 篇文章`, `${stats.categories} 个分类`, `${stats.tags} 个标签`].map(
              (item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs text-white/90 backdrop-blur-md"
                >
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <a
          href="#content"
          aria-label="向下浏览文章"
          className="absolute bottom-28 left-1/2 z-10 -translate-x-1/2 text-white/80 transition-colors hover:text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md">
            <ChevronDownIcon className="h-5 w-5 animate-bounce" />
          </span>
        </a>
      </div>
    </section>
  )
}
