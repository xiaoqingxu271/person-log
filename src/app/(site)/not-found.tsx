import Link from 'next/link'
import { ConstellationBird } from '@/components/constellation-bird'
import { ArrowRightIcon, HomeIcon } from '@/components/icons'

export default function SiteNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-3 py-16 sm:px-4 sm:py-24">
      <div className="glass-panel animate-fade-up rounded-3xl px-6 py-14 text-center sm:px-12">
        <ConstellationBird className="animate-float mx-auto h-20 w-20" />
        <p className="font-script aurora-text mt-6 text-3xl">Lost in the aurora</p>
        <h1 className="text-glow mt-3 text-6xl font-bold tracking-tight text-white">404</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          这片星域还没有被记录。你要找的页面可能已被移动，或从未存在。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="aurora-btn inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
          >
            <HomeIcon className="h-4 w-4" />
            返回首页
          </Link>
          <Link
            href="/archives"
            className="glass-chip inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm text-slate-300 transition-colors hover:border-ice-400/40 hover:text-ice-300"
          >
            浏览归档
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}