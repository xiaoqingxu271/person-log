'use client'

import { useEffect, useState } from 'react'
import type { TocItem } from '@/lib/toc'

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
      className="sticky top-8 max-h-[calc(100vh-5rem)] overflow-y-auto text-sm"
    >
      <div className="mb-2 font-semibold text-stone-900 dark:text-stone-100">目录</div>
      <ul className="space-y-1 border-l border-stone-200 dark:border-stone-800">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={
                '-ml-px block border-l py-0.5 transition-colors ' +
                (item.level === 3 ? 'pl-5 ' : 'pl-3 ') +
                (activeId === item.id
                  ? 'border-stone-900 font-medium text-stone-900 dark:border-stone-100 dark:text-white'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300')
              }
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
