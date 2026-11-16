'use client'

import { useEffect, useRef } from 'react'

/** 滚动进入视口时的渐进揭示；无 JS / 减少动态时保持可见 */
export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    el.classList.add('opacity-0', 'translate-y-4')
    let done = false
    const reveal = () => {
      if (done) return
      done = true
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      el.classList.remove('opacity-0', 'translate-y-4')
      if (delay) el.style.animationDelay = `${delay}ms`
      el.classList.add('animate-fade-up')
    }
    // 瞬时跳转（锚点/拖动滚动条）可能跳过 IO 回调，用位置兜底保证内容不会一直隐藏
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.94) reveal()
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) reveal()
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    )
    io.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      done = true
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      el.classList.remove('opacity-0', 'translate-y-4')
    }
  }, [delay])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}