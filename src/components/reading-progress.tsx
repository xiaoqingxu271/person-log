'use client'

import { useEffect, useRef } from 'react'

/** 文章内联阅读进度条（作者行下方的渐变细线 + 光点）；直接写样式，避免逐帧重渲染 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    let raf = 0

    function update() {
      raf = 0
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      const progress = total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0
      if (bar) bar.style.width = `${Math.max(progress, 2)}%`
    }
    function schedule() {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden className="relative mt-5 h-[3px] w-full rounded-full bg-white/8">
      <div
        ref={barRef}
        className="relative h-full rounded-full bg-gradient-to-r from-aurora-400 via-ice-400 to-nebula-400 transition-[width] duration-150"
        style={{ width: '2%' }}
      >
        <span className="absolute -right-1 -top-[3px] h-2 w-2 rounded-full bg-ice-300 shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
      </div>
    </div>
  )
}
