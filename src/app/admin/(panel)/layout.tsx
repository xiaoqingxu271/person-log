import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { countPendingComments } from '@/lib/comments'
import { LogoutButton } from '@/components/admin/logout-button'
import { getSiteConfig } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')
  const [cfg, pendingCount] = await Promise.all([getSiteConfig(), countPendingComments()])

  const navClass =
    'rounded px-2 py-1.5 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800'

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-48 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-6 text-sm font-bold">{cfg.siteName}</div>
        <nav className="flex flex-1 flex-col gap-1 text-sm">
          <Link href="/admin/posts" className={navClass}>
            文章管理
          </Link>
          <Link href="/admin/comments" className={navClass}>
            评论管理
            {pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-600 px-1.5 text-xs text-white">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link href="/admin/settings" className={navClass}>
            站点设置
          </Link>
          <a href="/api/export" className={navClass} download>
            导出文章 ⬇
          </a>
          <Link href="/" target="_blank" className={navClass}>
            查看站点 ↗
          </Link>
        </nav>
        <div className="text-xs text-neutral-400">登录：{user}</div>
        <LogoutButton />
      </aside>
      <div className="flex-1 bg-white p-8 dark:bg-neutral-950">{children}</div>
    </div>
  )
}
