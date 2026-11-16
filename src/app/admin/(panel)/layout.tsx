import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { countPendingComments } from '@/lib/comments'
import { getSiteConfig } from '@/lib/site-config'
import { AdminShell } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/admin/login')
  const [cfg, pendingCount] = await Promise.all([getSiteConfig(), countPendingComments()])

  return (
    <AdminShell siteName={cfg.siteName} user={user} pendingCount={pendingCount}>
      {children}
    </AdminShell>
  )
}
