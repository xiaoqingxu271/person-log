import { listVisibleMusic } from '@/lib/music'
import { MusicLibrary } from '@/components/music-library'
import { SparkleIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '音乐库' }

export default async function MusicPage() {
  const items = await listVisibleMusic()
  const artists = new Set(items.map((i) => i.artist)).size
  const rated = items.filter((i) => i.rating > 0)
  const avg = rated.length > 0 ? (rated.reduce((s, i) => s + i.rating, 0) / rated.length).toFixed(1) : null

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 py-10 sm:px-4">
      {/* 英雄区：Welcome to 音乐库 Music */}
      <header className="animate-fade-up text-center">
        <p className="font-script text-2xl text-slate-200">Welcome to</p>
        <div className="mt-1 flex items-center justify-center gap-4">
          <h1 className="font-brush aurora-text text-glow text-6xl leading-tight sm:text-7xl">音乐库</h1>
          <svg viewBox="0 0 40 40" className="h-8 w-8 text-ice-300" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <circle cx="20" cy="20" r="16" />
            <circle cx="20" cy="20" r="6" fill="rgba(125,211,252,0.3)" />
            <circle cx="20" cy="20" r="1.5" fill="currentColor" />
          </svg>
          <span className="font-script aurora-text text-5xl sm:text-6xl">Music</span>
        </div>
        <p className="mt-4 flex items-center justify-center gap-3 text-sm text-slate-300">
          <SparkleIcon className="h-3 w-3 text-ice-300" />
          那些循环过的旋律，都住在这里
          <SparkleIcon className="h-3 w-3 text-ice-300" />
        </p>
        <div className="mx-auto mt-5 h-px w-64 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-400">
          <span className="glass-chip rounded-full px-3.5 py-1.5">{items.length} 张专辑</span>
          <span className="glass-chip rounded-full px-3.5 py-1.5">{artists} 位艺术家</span>
          {avg && <span className="glass-chip rounded-full px-3.5 py-1.5">平均 {avg} 星</span>}
        </div>
      </header>

      <div className="mt-10">
        {items.length === 0 ? (
          <div className="glass-panel rounded-2xl py-16 text-center text-sm text-slate-400">
            音乐库还在整理中，很快与你见面。
          </div>
        ) : (
          <MusicLibrary items={items} />
        )}
      </div>

      <p className="mt-14 text-center">
        <span className="font-script aurora-text text-2xl">Music is the shorthand of emotion</span>
        <span className="mt-2 block text-xs tracking-[0.3em] text-slate-500">— 戴上耳机 · 世界安静 —</span>
      </p>
    </div>
  )
}