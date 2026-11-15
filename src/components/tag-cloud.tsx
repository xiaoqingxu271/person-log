import Link from 'next/link'
import { Flourish } from '@/components/flourish'
import { TagIcon } from '@/components/icons'

export interface CloudTag {
  id: number
  name: string
  slug: string
  count: number
}

const TINTS = ['text-ice-200', 'text-nebula-200', 'text-aurora-200', 'text-flare-200', 'text-slate-200']

const POEMS: Record<string, string> = {
  旅行: '与风景的相遇',
  天文: '与星空的对话',
  宇宙: '与星空的对话',
  前端开发: '与代码的修行',
  随笔: '与自己的交谈',
  摄影: '与光影的约定',
}

export function tagPoem(name: string): string {
  return POEMS[name] ?? '与思想的相遇'
}

/** 标签云：热度决定字号，选中态紫色辉光 */
export function TagCloud({ tags, activeSlug }: { tags: CloudTag[]; activeSlug?: string }) {
  const max = Math.max(1, ...tags.map((t) => t.count))
  return (
    <section className="glass-panel animate-fade-up rounded-3xl px-6 py-8 sm:px-10">
      <div className="flex items-center justify-center gap-4">
        <Flourish className="h-4 w-24" />
        <h1 className="flex items-center gap-2 text-xl font-bold text-white">
          <TagIcon className="h-5 w-5 text-ice-300" />
          标签云
        </h1>
        <Flourish className="h-4 w-24" flip />
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">标签热度越高，字号越大哦～</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {tags.map((tag, index) => {
          const size = 13 + Math.round((tag.count / max) * 9)
          const active = tag.slug === activeSlug
          return (
            <Link
              key={tag.id}
              href={`/tags/${encodeURIComponent(tag.slug)}`}
              className={`cloud-pill inline-flex items-center gap-1.5 ${TINTS[index % TINTS.length]} ${active ? 'cloud-pill-active' : ''}`}
              style={{ fontSize: `${size}px` }}
              aria-current={active ? 'page' : undefined}
            >
              {tag.name}
              {active && (
                <svg viewBox="0 0 24 24" className="h-[1em] w-[1em]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                </svg>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}