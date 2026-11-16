'use client'

import { useEffect, useState } from 'react'
import { AdminNav } from '@/components/admin/admin-nav'
import { LogoutButton } from '@/components/admin/logout-button'
import { LogoMark } from '@/components/logo-mark'
import { MenuIcon, XIcon } from '@/components/icons'

interface Props {
  siteName: string
  user: string
  pendingCount: number
  children: React.ReactNode
}

/** 后台外壳：桌面常驻侧栏，手机改为顶部栏 + 抽屉导航 */
export function AdminShell({ siteName, user, pendingCount, children }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-screen lg:flex">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-stone-800 dark:bg-stone-900/95 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="打开导航菜单"
          aria-expanded={open}
          className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <LogoMark className="h-7 w-7" />
        <span className="min-w-0 truncate text-sm font-bold tracking-tight text-stone-900 dark:text-white">
          {siteName}
        </span>
        <span className="ml-auto text-xs text-stone-400">管理后台</span>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto border-r border-stone-200 bg-white p-5 transition-transform duration-200 dark:border-stone-800 dark:bg-stone-900 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-60 lg:translate-x-0 ' +
          (open ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <div className="mb-8 flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold tracking-tight text-stone-900 dark:text-white">
              {siteName}
            </div>
            <div className="text-xs text-stone-400">管理后台</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="关闭导航菜单"
            className="ml-auto rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 lg:hidden"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <AdminNav pendingCount={pendingCount} onNavigate={() => setOpen(false)} />

        <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-300">
              {user.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-stone-700 dark:text-stone-200">
                {user}
              </div>
              <div className="text-xs text-stone-400">管理员</div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  )
}
