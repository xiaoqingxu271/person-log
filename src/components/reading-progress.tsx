'use client'

import { useEffect, useState } from 'react'

/** 文章内联阅读进度条（作者行下方的渐变细线 + 光点） */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function update() {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div aria-hidden className="relative mt-5 h-[3px] w-full rounded-full bg-white/8">
      <div
        className="relative h-full rounded-full bg-gradient-to-r from-aurora-400 via-ice-400 to-nebula-400 transition-[width] duration-150"
        style={{ width: `${Math.max(progress, 2)}%` }}
      >
        <span className="absolute -right-1 -top-[3px] h-2 w-2 rounded-full bg-ice-300 shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
      </div>
    </div>
  )
}