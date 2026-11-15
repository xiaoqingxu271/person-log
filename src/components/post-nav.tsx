import Link from 'next/link'
import { ArrowRightIcon } from '@/components/icons'

interface AdjacentPost {
  title: string
  slug: string
}

/** 文章底部上一篇 / 下一篇导航胶囊 */
export function PostNav({ prev, next }: { prev: AdjacentPost | null; next: AdjacentPost | null }) {
  if (!prev && !next) return null
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-between gap-3" aria-label="文章导航">
      {prev ? (
        <Link
          href={`/posts/${prev.slug}`}
          className="glass-chip group inline-flex max-w-full items-center gap-2 rounded-full px-5 py-2.5 text-sm text-slate-300 transition-all hover:-translate-y-0.5 hover:border-ice-400/40 hover:text-ice-300"
        >
          <ArrowRightIcon className="h-4 w-4 shrink-0 rotate-180 transition-transform group-hover:-translate-x-0.5" />
          <span className="truncate">上一篇：{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/posts/${next.slug}`}
          className="aurora-btn group inline-flex max-w-full items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
        >
          <span className="truncate">下一篇：{next.title}</span>
          <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}