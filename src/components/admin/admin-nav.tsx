'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileTextIcon, MessageIcon, SettingsIcon, DownloadIcon, ExternalLinkIcon } from '@/components/icons'

const items = [
  { href: '/admin/posts', label: '文章管理', icon: FileTextIcon },
  { href: '/admin/comments', label: '评论管理', icon: MessageIcon },
  { href: '/admin/settings', label: '站点设置', icon: SettingsIcon },
]

/** 后台侧栏导航：当前页高亮；评论管理带待审数量角标 */
export function AdminNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname()

  const itemClass = (active: boolean) =>
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ' +
    (active
      ? 'bg-stone-900 font-medium text-white dark:bg-white dark:text-stone-900'
      : 'text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200')

  return (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link key={item.href} href={item.href} className={itemClass(active)}>
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
            {item.href === '/admin/comments' && pendingCount > 0 && (
              <span
                className={
                  'ml-auto rounded-full px-2 py-0.5 text-xs font-medium ' +
                  (active
                    ? 'bg-white/20 text-inherit dark:bg-stone-900/20'
                    : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400')
                }
              >
                {pendingCount}
              </span>
            )}
          </Link>
        )
      })}

      <div className="my-3 border-t border-stone-200 dark:border-stone-800" />

      <a
        href="/api/export"
        download
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      >
        <DownloadIcon className="h-4 w-4 shrink-0" />
        <span>导出文章</span>
      </a>
      <a
        href="/"
        target="_blank"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-600 transition-colors hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      >
        <ExternalLinkIcon className="h-4 w-4 shrink-0" />
        <span>查看站点</span>
      </a>
    </nav>
  )
}
