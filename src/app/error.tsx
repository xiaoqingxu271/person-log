'use client'

import Link from 'next/link'
import { AuroraBackground } from '@/components/aurora-background'
import { HomeIcon } from '@/components/icons'
import { errorDigest } from '@/lib/error-digest'

export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = errorDigest(error)

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <AuroraBackground />
      <div className="glass-panel relative z-10 w-full max-w-md rounded-3xl px-8 py-12 text-center">
        <p className="font-script aurora-text text-2xl">A ripple in the aurora</p>
        <h1 className="text-glow mt-2 text-3xl font-bold text-white">页面出了点问题</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          服务暂时异常，稍后重试或返回首页。
        </p>
        {digest ? <p className="mt-2 text-xs text-slate-500">错误编号：{digest}</p> : null}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
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
