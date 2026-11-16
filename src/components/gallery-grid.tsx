'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import type { Photo } from '@prisma/client'
import { formatDate } from '@/lib/format'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, MapPinIcon, XIcon } from '@/components/icons'

function PhotoMeta({ photo, className = '' }: { photo: Photo; className?: string }) {
  return (
    <span className={`flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      {photo.location && (
        <span className="inline-flex items-center gap-1">
          <MapPinIcon className="h-3.5 w-3.5" />
          {photo.location}
        </span>
      )}
      {photo.takenAt && (
        <span className="inline-flex items-center gap-1">
          <CalendarIcon className="h-3.5 w-3.5" />
          {formatDate(photo.takenAt)}
        </span>
      )}
    </span>
  )
}

interface LightboxProps {
  photos: Photo[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

/** 灯箱：键盘 ←/→/Esc、触摸滑动、点击遮罩关闭、锁定背景滚动 */
function Lightbox({ photos, index, onClose, onPrev, onNext }: LightboxProps) {
  const photo = photos[index]
  const touchX = useRef<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, onPrev, onNext])

  if (!photo) return null

  // 渲染到 body：避免被 main 的 z-10 堆叠上下文压住导航栏
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`查看照片：${photo.title}`}
      className="fixed inset-0 z-[100] flex flex-col bg-night-950/95 backdrop-blur-md"
    >
      {/* 顶栏：计数 + 关闭 */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <span className="glass-chip rounded-full px-3.5 py-1.5 text-xs tabular-nums text-slate-300">
          {index + 1} / {photos.length}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="关闭大图"
          className="glass-chip rounded-full p-2.5 text-slate-200 transition-colors hover:border-flare-400/50 hover:text-white"
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      {/* 图片区：点击空白关闭，支持触摸滑动 */}
      <div
        className="relative min-h-0 flex-1"
        onClick={onClose}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return
          const delta = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(delta) > 50) {
            if (delta > 0) onPrev()
            else onNext()
          }
          touchX.current = null
        }}
      >
        <div key={photo.id} className="animate-fade-up absolute inset-2 sm:inset-x-16 sm:inset-y-4" onClick={(e) => e.stopPropagation()}>
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        </div>
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onPrev()
              }}
              aria-label="上一张"
              className="glass-chip absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-slate-200 transition-colors hover:border-ice-400/50 hover:text-white sm:left-4"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              aria-label="下一张"
              className="glass-chip absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2.5 text-slate-200 transition-colors hover:border-ice-400/50 hover:text-white sm:right-4"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* 说明栏 */}
      <div className="px-4 pb-5 pt-3 text-center sm:px-6">
        <h2 className="font-serif-cn text-lg font-bold text-white sm:text-xl">{photo.title}</h2>
        <PhotoMeta photo={photo} className="mt-1.5 justify-center text-xs text-slate-400" />
        {photo.description && <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-300">{photo.description}</p>}
      </div>
    </div>,
    document.body,
  )
}

/** 相册瀑布流 + 灯箱 */
export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const close = useCallback(() => setOpenIndex(null), [])
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  )
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length],
  )

  return (
    <>
      <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`查看大图：${photo.title}`}
            className="animate-fade-up group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-xl border border-white/10 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-ice-400/40 hover:shadow-[0_10px_32px_rgba(14,165,233,0.18)]"
            style={{ animationDelay: `${Math.min(index, 10) * 50}ms` }}
          >
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              width={photo.width || 1200}
              height={photo.height || 900}
              sizes="(max-width: 640px) 94vw, (max-width: 1280px) 46vw, 30vw"
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading={index < 3 ? 'eager' : 'lazy'}
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night-950/85 via-night-950/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="font-serif-cn block truncate text-base font-bold text-white">{photo.title}</span>
              <PhotoMeta photo={photo} className="mt-1 text-xs text-slate-300" />
            </span>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox photos={photos} index={openIndex} onClose={close} onPrev={prev} onNext={next} />
      )}
    </>
  )
}