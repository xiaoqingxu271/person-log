'use client'

import { SearchIcon } from '@/components/icons'

/** 页头搜索框：回车或点击图标跳转到 /search */
export function HeaderSearch({ className = 'hidden md:block' }: { className?: string }) {
  return (
    <form action="/search" className={`relative ${className}`}>
      <input
        type="search"
        name="q"
        placeholder="搜索文章…"
        aria-label="搜索文章"
        onKeyDown={(e) => {
          // 显式触发提交，兼容部分环境对隐式表单提交的差异
          if (e.key === 'Enter') e.currentTarget.form?.requestSubmit()
        }}
        className="glass-input h-9 w-40 rounded-full py-0 pl-9 pr-3 text-sm transition-all focus:w-52"
      />
      <button
        type="submit"
        aria-label="搜索"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-ice-300"
      >
        <SearchIcon className="h-3.5 w-3.5" />
      </button>
    </form>
  )
}