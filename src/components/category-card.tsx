import Link from 'next/link'
import { ArrowRightIcon } from '@/components/icons'

export interface CategoryMeta {
  en: string
  hue: [string, string]
  tint: string
  icon: 'code' | 'planet' | 'camera' | 'book' | 'headphones' | 'bulb'
}

const META: CategoryMeta[] = [
  { en: 'Frontend Development', hue: ['#38bdf8', '#0ea5e9'], tint: 'rgba(14,165,233,0.10)', icon: 'code' },
  { en: 'Astronomy & Universe', hue: ['#a78bfa', '#8b5cf6'], tint: 'rgba(139,92,246,0.10)', icon: 'planet' },
  { en: 'Travel Photography', hue: ['#34d399', '#10b981'], tint: 'rgba(16,185,129,0.10)', icon: 'camera' },
  { en: 'Life Essays', hue: ['#7dd3fc', '#6366f1'], tint: 'rgba(99,102,241,0.10)', icon: 'book' },
  { en: 'Music & Audio', hue: ['#6ee7b7', '#059669'], tint: 'rgba(5,150,105,0.10)', icon: 'headphones' },
  { en: 'Learning Notes', hue: ['#c4b5fd', '#d946ef'], tint: 'rgba(217,70,239,0.10)', icon: 'bulb' },
]

const EN_BY_NAME: Record<string, string> = {
  前端开发: 'Frontend Development',
  天文: 'Astronomy & Universe',
  旅行: 'Travel Photography',
  随笔: 'Life Essays',
}

export function metaFor(index: number, name?: string): CategoryMeta {
  const en = name ? EN_BY_NAME[name] : undefined
  const base = (en && META.find((m) => m.en === en)) || META[index % META.length]
  return { ...base, en: en || base.en }
}

export function CategoryIcon({ icon, className }: { icon: CategoryMeta['icon']; className?: string }) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  }
  switch (icon) {
    case 'code':
      return (
        <svg {...common}>
          <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
        </svg>
      )
    case 'planet':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6" />
          <ellipse cx="12" cy="12" rx="11" ry="4" transform="rotate(-18 12 12)" />
        </svg>
      )
    case 'camera':
      return (
        <svg {...common}>
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      )
    case 'book':
      return (
        <svg {...common}>
          <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2ZM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8Z" />
        </svg>
      )
    case 'headphones':
      return (
        <svg {...common}>
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
        </svg>
      )
  }
}

export interface CategoryCardProps {
  name: string
  slug: string
  description: string
  count: number
  index: number
  topTags: { name: string; slug: string }[]
}

/** 分类玻璃卡：渐变圆图标 + 中英文名 + 篇数 + 描述 + 高频标签 + 圆形箭头 */
export function CategoryCard({ name, slug, description, count, index, topTags }: CategoryCardProps) {
  const meta = metaFor(index, name)
  return (
    <Link
      href={`/categories/${encodeURIComponent(slug)}`}
      className="glass-panel group relative flex flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ice-400/35 hover:shadow-[0_16px_44px_rgba(14,165,233,0.18)]"
      style={{ background: `linear-gradient(150deg, ${meta.tint}, rgba(9,13,32,0.62))` }}
    >
      <div className="flex items-start gap-3.5">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_18px_rgba(2,6,23,0.4)]"
          style={{ background: `linear-gradient(135deg, ${meta.hue[0]}, ${meta.hue[1]})` }}
        >
          <CategoryIcon icon={meta.icon} className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-bold text-white transition-colors group-hover:text-aurora-300">
            {name}
          </span>
          <span className="mt-0.5 block truncate text-xs text-slate-400">{meta.en}</span>
        </span>
        <span className="shrink-0 text-sm text-slate-300">
          {count} <span className="text-xs text-slate-500">篇</span>
        </span>
      </div>

      <p className="mt-3.5 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-300">
        {description || '探索与记录，沉淀每一次思考。'}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3.5">
        <span className="flex min-w-0 flex-wrap gap-1.5">
          {topTags.map((tag) => (
            <span key={tag.slug} className="glass-chip rounded-full px-2 py-0.5 text-[11px] text-slate-400">
              #{tag.name}
            </span>
          ))}
        </span>
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:translate-x-0.5"
          style={{ background: `linear-gradient(135deg, ${meta.hue[0]}, ${meta.hue[1]})` }}
        >
          <ArrowRightIcon className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}