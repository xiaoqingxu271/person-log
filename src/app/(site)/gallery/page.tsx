import { listVisiblePhotos } from '@/lib/photos'
import { GalleryGrid } from '@/components/gallery-grid'
import { SparkleIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '相册' }

export default async function GalleryPage() {
  const photos = await listVisiblePhotos()
  const places = new Set(photos.map((p) => p.location).filter(Boolean)).size

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 py-10 sm:px-4">
      {/* 英雄区：Welcome to 相册 Gallery */}
      <header className="animate-fade-up text-center">
        <p className="font-script text-2xl text-slate-200">Welcome to</p>
        <div className="mt-1 flex items-center justify-center gap-4">
          <h1 className="font-brush aurora-text text-glow text-6xl leading-tight sm:text-7xl">相册</h1>
          <svg viewBox="0 0 40 40" className="h-8 w-8 text-flare-300" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="5" y="11" width="30" height="22" rx="4" />
            <path d="M14 11l3-5h6l3 5" />
            <circle cx="20" cy="22" r="6" fill="rgba(240,171,252,0.25)" />
          </svg>
          <span className="font-script aurora-text text-5xl sm:text-6xl">Gallery</span>
        </div>
        <p className="mt-4 flex items-center justify-center gap-3 text-sm text-slate-300">
          <SparkleIcon className="h-3 w-3 text-ice-300" />
          把路过的光，都收进这里
          <SparkleIcon className="h-3 w-3 text-ice-300" />
        </p>
        <div className="mx-auto mt-5 h-px w-64 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400">
          <span className="glass-chip rounded-full px-3.5 py-1.5">{photos.length} 张照片</span>
          {places > 0 && <span className="glass-chip rounded-full px-3.5 py-1.5">{places} 个地点</span>}
          <span className="glass-chip rounded-full px-3.5 py-1.5">点击照片查看大图</span>
        </div>
      </header>

      <div className="mt-10">
        {photos.length === 0 ? (
          <div className="glass-panel rounded-2xl py-16 text-center text-sm text-slate-400">
            相册还是空的，等第一束光入住。
          </div>
        ) : (
          <GalleryGrid photos={photos} />
        )}
      </div>

      <p className="mt-14 text-center">
        <span className="font-script aurora-text text-2xl">Every photo is a stop of time</span>
        <span className="mt-2 block text-xs tracking-[0.3em] text-slate-500">— 快门按下 · 时间停留 —</span>
      </p>
    </div>
  )
}