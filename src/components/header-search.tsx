'use client'

import { SearchIcon } from '@/components/icons'

/** 页头搜索框：回车或点击图标跳转到 /search */
export function HeaderSearch() {
  return (
    <form action="/search" className="relative hidden sm:block">
      <input
        type="search"
        name="q"
        placeholder="搜索文章…"
        aria-label="搜索文章"
        onKeyDown={(e) => {
          // 显式触发提交，兼容部分环境对隐式表单提交的差异
          if (e.key === 'Enter') e.currentTarget.form?.requestSubmit()
        }}
        className="h-9 w-36 rounded-full border border-stone-200 bg-stone-100/70 pl-9 pr-3 text-sm transition-all placeholder:text-stone-400 focus:w-48 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-800/60 dark:placeholder:text-stone-500 dark:focus:bg-stone-900"
      />
      <button
        type="submit"
        aria-label="搜索"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-orange-500"
      >
        <SearchIcon className="h-3.5 w-3.5" />
      </button>
    </form>
  )
}
