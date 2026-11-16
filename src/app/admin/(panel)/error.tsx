'use client'

import Link from 'next/link'
import { errorDigest } from '@/lib/error-digest'

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = errorDigest(error)

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-900">
      <h1 className="text-xl font-bold text-stone-900 dark:text-white">后台页面加载失败</h1>
      <p className="mt-3 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
        数据库或服务可能暂时不可用，重试一般即可恢复。若持续失败，请查看服务器日志。
      </p>
      {digest ? (
        <p className="mt-2 text-xs text-stone-400 dark:text-stone-500">错误编号：{digest}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
        >
          重试
        </button>
        <Link
          href="/admin"
          className="rounded-lg border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-colors hover:border-stone-300 hover:text-stone-900 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:text-white"
        >
          返回看板
        </Link>
      </div>
    </div>
  )
}
