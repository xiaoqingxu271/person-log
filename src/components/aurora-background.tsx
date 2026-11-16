'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'

/** 全站固定背景：极光夜景照片 + 压暗渐变 + 漂移光晕 + 星点 + 颗粒；滚动时轻微视差 */
export function AuroraBackground() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = layerRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      el.style.transform = `translate3d(0, ${window.scrollY * 0.06}px, 0) scale(1.12)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div aria-hidden className="aurora-scene">
      <div ref={layerRef} className="absolute inset-0 will-change-transform">
        <Image
          src="/images/aurora-bg.jpg"
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover"
        />
        <div className="aurora-glow aurora-glow-a" />
        <div className="aurora-glow aurora-glow-b" />
        <div className="aurora-stars" />
      </div>
      <div className="aurora-scene-scrim" />
      <div className="aurora-grain" />
    </div>
  )
}