'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import type { MusicItem } from '@prisma/client'
import { HeadphonesIcon, PauseIcon, PlayIcon, StarIcon } from '@/components/icons'
import { useAudio, type Track } from '@/components/audio/audio-context'
import { Equalizer } from '@/components/audio/equalizer'

function Stars({ rating, className = 'h-3.5 w-3.5' }: { rating: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={rating > 0 ? `${rating} 星` : '未评分'}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={`${className} ${n <= rating ? 'text-amber-300' : 'text-white/15'}`} filled={n <= rating} />
      ))}
    </span>
  )
}

/** 黑胶唱片：悬停时从封面后滑出并旋转 */
function VinylDisc() {
  return (
    <span
      aria-hidden
      className="absolute inset-y-[3%] right-0 aspect-square rounded-full transition-transform duration-500 ease-out group-hover:translate-x-[18%] group-hover:rotate-[80deg]"
      style={{
        background: 'repeating-radial-gradient(circle at center, #050505 0 2px, #1c1c1c 2px 4px)',
        boxShadow: '0 6px 20px rgba(2,6,23,0.6)',
      }}
    >
      <span className="absolute inset-[31%] rounded-full bg-gradient-to-br from-aurora-400 via-ice-400 to-nebula-500" />
      <span className="absolute inset-[45%] rounded-full bg-night-950" />
    </span>
  )
}

function ListenLink({ url, compact = false }: { url: string; compact?: boolean }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={
        compact
          ? 'glass-chip inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-slate-200 transition-colors hover:border-aurora-400/50 hover:text-aurora-300'
          : 'aurora-btn inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium'
      }
    >
      <PlayIcon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
      {compact ? '收听' : '去听这张专辑'}
    </a>
  )
}

const toTrack = (m: MusicItem): Track => ({
  id: m.id,
  title: m.title,
  artist: m.artist,
  coverUrl: m.coverUrl,
  audioUrl: m.audioUrl,
})

/** 播放按钮：有站内音源直接播放，否则回退外链收听 */
function PlayButton({ track, queue, compact = false }: { track: MusicItem; queue: Track[]; compact?: boolean }) {
  const { current, isPlaying, play, toggle } = useAudio()
  const isCurrent = current?.id === track.id
  const playing = isCurrent && isPlaying

  if (!track.audioUrl) return <ListenLink url={track.listenUrl} compact={compact} />

  const onClick = () => (isCurrent ? toggle() : play(toTrack(track), queue))

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={playing ? `暂停 ${track.title}` : `播放 ${track.title}`}
        className={
          'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-colors ' +
          (isCurrent
            ? 'border-aurora-400/40 bg-gradient-to-r from-aurora-500/25 to-ice-500/25 text-aurora-200'
            : 'glass-chip border-transparent text-slate-200 hover:border-aurora-400/50 hover:text-aurora-300')
        }
      >
        {playing ? <Equalizer className="h-3" /> : <PlayIcon className="h-3 w-3" />}
        {playing ? '播放中' : isCurrent ? '继续' : '播放'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={playing ? '暂停' : '播放专辑'}
      className="aurora-btn inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
    >
      {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      {playing ? '暂停' : isCurrent ? '继续播放' : '播放专辑'}
      {playing && <Equalizer className="ml-1 h-3.5" />}
    </button>
  )
}

/** 音乐库：风格筛选 + 排序 + 主打专辑 + 封面网格 */
export function MusicLibrary({ items }: { items: MusicItem[] }) {
  const [genre, setGenre] = useState('全部')
  const [sort, setSort] = useState<'new' | 'rating'>('new')

  const genres = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) {
      if (item.genre) counts.set(item.genre, (counts.get(item.genre) ?? 0) + 1)
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [items])

  const list = useMemo(() => {
    const filtered = genre === '全部' ? items : items.filter((i) => i.genre === genre)
    return [...filtered].sort((a, b) =>
      sort === 'rating'
        ? b.rating - a.rating || b.id - a.id
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() || b.id - a.id,
    )
  }, [items, genre, sort])

  const [spotlight, ...rest] = list
  const { current } = useAudio()
  const tracks = useMemo(() => list.map(toTrack), [list])

  return (
    <div>
      {/* 筛选 + 排序 */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button type="button" onClick={() => setGenre('全部')} className={`cloud-pill text-sm ${genre === '全部' ? 'cloud-pill-active' : ''}`}>
            全部 <span className="ml-1 text-xs opacity-70">{items.length}</span>
          </button>
          {genres.map(([name, count]) => (
            <button key={name} type="button" onClick={() => setGenre(name)} className={`cloud-pill text-sm ${genre === name ? 'cloud-pill-active' : ''}`}>
              {name} <span className="ml-1 text-xs opacity-70">{count}</span>
            </button>
          ))}
        </div>
        <div className="glass-chip inline-flex items-center rounded-full p-1 text-xs" role="group" aria-label="排序方式">
          {(
            [
              { key: 'new', label: '最新加入' },
              { key: 'rating', label: '评分最高' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSort(opt.key)}
              aria-pressed={sort === opt.key}
              className={
                'rounded-full px-4 py-1.5 transition-colors ' +
                (sort === opt.key ? 'bg-gradient-to-r from-ice-500/40 to-nebula-500/40 font-medium text-white' : 'text-slate-400 hover:text-slate-200')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="glass-panel mt-10 rounded-2xl py-16 text-center text-sm text-slate-400">
          这个风格下还没有专辑，去后台添加一张吧。
        </div>
      ) : (
        <>
          {/* 主打专辑 */}
          {spotlight && (
            <section className="glass-panel animate-fade-up relative mt-10 overflow-hidden rounded-3xl p-6 sm:p-8">
              <div aria-hidden className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-nebula-500/15 blur-3xl" />
              <div className="relative grid items-center gap-7 md:grid-cols-[280px_1fr] lg:gap-10">
                <div className="group relative mx-auto aspect-square w-full max-w-70 md:mx-0">
                  <VinylDisc />
                  <div className="absolute inset-0 z-10 overflow-hidden rounded-2xl border border-white/15 bg-night-800 shadow-[0_16px_44px_rgba(2,6,23,0.6)]">
                    {spotlight.coverUrl ? (
                      <Image src={spotlight.coverUrl} alt={`${spotlight.title} 封面`} fill sizes="(max-width: 768px) 90vw, 280px" className="object-cover" priority />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-night-700 to-night-800 text-slate-500">
                        <HeadphonesIcon className="h-12 w-12" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-0 text-center md:text-left">
                  <p className="flex items-center justify-center gap-2 text-xs tracking-[0.25em] text-ice-300 md:justify-start">
                    <HeadphonesIcon className="h-3.5 w-3.5" />
                    {sort === 'rating' ? '评分最高' : '最近加入'}
                  </p>
                  <h2 className="font-serif-cn mt-3 text-3xl font-bold leading-snug text-white sm:text-4xl">{spotlight.title}</h2>
                  <p className="mt-2 text-base text-slate-300">{spotlight.artist}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                    <Stars rating={spotlight.rating} className="h-4 w-4" />
                    {spotlight.genre && <span className="glass-chip rounded-full px-3 py-1 text-xs text-slate-200">{spotlight.genre}</span>}
                  </div>
                  {spotlight.review && (
                    <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-300 md:mx-0">
                      <span aria-hidden className="font-serif-cn mr-1 text-xl leading-none text-nebula-400">“</span>
                      {spotlight.review}
                      <span aria-hidden className="font-serif-cn ml-1 text-xl leading-none text-nebula-400">”</span>
                    </p>
                  )}
                  <div className="mt-6 flex justify-center md:justify-start">
                    <PlayButton track={spotlight} queue={tracks} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 专辑网格 */}
          {rest.length > 0 && (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {rest.map((item, index) => (
                <article
                  key={item.id}
                  className={`glass-panel animate-fade-up group relative flex flex-col rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:z-20 hover:glow-ring ${item.id === current?.id ? 'glow-ring' : ''}`}
                  style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
                >
                  <div className="relative aspect-square">
                    <VinylDisc />
                    <div className="absolute inset-0 z-10 overflow-hidden rounded-xl border border-white/12 bg-night-800">
                      {item.coverUrl ? (
                        <Image src={item.coverUrl} alt={`${item.title} 封面`} fill sizes="(max-width: 640px) 92vw, (max-width: 1280px) 45vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-night-700 to-night-800 text-slate-500">
                          <HeadphonesIcon className="h-9 w-9" />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex min-w-0 flex-1 flex-col">
                    <h3 className="font-serif-cn truncate text-lg font-bold text-white transition-colors group-hover:text-aurora-300" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="mt-0.5 truncate text-sm text-slate-400">{item.artist}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <Stars rating={item.rating} />
                      {item.genre && <span className="glass-chip shrink-0 rounded-full px-2.5 py-0.5 text-[11px] text-slate-300">{item.genre}</span>}
                    </div>
                    {item.review && <p className="mt-2.5 line-clamp-2 min-h-8 text-xs leading-relaxed text-slate-400">{item.review}</p>}
                    <div className="mt-auto flex justify-end pt-3">
                      <PlayButton track={item} queue={tracks} compact />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}