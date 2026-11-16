'use client'

import Link from 'next/link'
import { HomeIcon } from '@/components/icons'
import { errorDigest } from '@/lib/error-digest'

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = errorDigest(error)

  return (
    <div className="mx-auto w-full max-w-2xl px-3 py-16 sm:px-4 sm:py-24">
      <div className="glass-panel animate-fade-up rounded-3xl px-6 py-14 text-center sm:px-12">
        <p className="font-script aurora-text text-3xl">A ripple in the aurora</p>
        <h1 className="text-glow mt-3 text-3xl font-bold text-white sm:text-4xl">
          页面暂时无法显示
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          可能是数据库连接波动或服务临时异常，稍后重试通常就能恢复。
        </p>
        {digest ? <p className="mt-2 text-xs text-slate-500">错误编号：{digest}</p> : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="aurora-btn inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
          >
            重试
          </button>
          <Link
            href="/"
            className="glass-chip inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm text-slate-300 transition-colors hover:border-ice-400/40 hover:text-ice-300"
          >
            <HomeIcon className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
