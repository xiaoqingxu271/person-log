'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/toc'
import { ChevronDownIcon } from '@/components/icons'

/** 编号目录：01/02… + 右侧箭头，当前章节高亮（极光玻璃卡） */
export function Toc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
            break
          }
        }
      },
      // 视口上部 30% 区域命中的标题视为当前章节
      { rootMargin: '0px 0px -70% 0px' },
    )
    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav
      aria-label="文章目录"
      className="glass-panel sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl p-4 text-sm"
    >
      <div className="mb-3 flex items-center gap-2 px-1 font-semibold text-white">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ice-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2ZM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8Z" />
        </svg>
        目录 / TOC
      </div>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={
                'group flex items-center gap-2.5 rounded-lg py-2 pl-3 pr-2 transition-colors ' +
                (item.level === 3 ? 'ml-4 ' : '') +
                (activeId === item.id
                  ? 'border-l-2 border-aurora-400 bg-white/8 font-medium text-aurora-300'
                  : 'border-l-2 border-transparent text-slate-400 hover:bg-white/5 hover:text-ice-300')
              }
            >
              <span className="font-mono text-xs text-slate-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 truncate">{item.text}</span>
              <ChevronDownIcon className="h-3.5 w-3.5 -rotate-90 text-slate-600 transition-colors group-hover:text-ice-300" />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}