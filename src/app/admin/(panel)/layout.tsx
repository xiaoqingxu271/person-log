import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { countPendingComments } from '@/lib/comments'
import { getSiteConfig } from '@/lib/site-config'
import { AdminNav } from '@/components/admin/admin-nav'
import { LogoutButton } from '@/components/admin/logout-button'
import { LogoMark } from '@/components/logo-mark'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')
  const [cfg, pendingCount] = await Promise.all([getSiteConfig(), countPendingComments()])

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="mb-8 flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold tracking-tight text-stone-900 dark:text-white">
              {cfg.siteName}
            </div>
            <div className="text-xs text-stone-400">管理后台</div>
          </div>
        </div>

        <AdminNav pendingCount={pendingCount} />

        <div className="mt-4 border-t border-stone-200 pt-4 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-500 dark:bg-stone-800 dark:text-stone-300">
              {user.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-stone-700 dark:text-stone-200">{user}</div>
              <div className="text-xs text-stone-400">管理员</div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8 lg:p-10">{children}</main>
    </div>
  )
}
