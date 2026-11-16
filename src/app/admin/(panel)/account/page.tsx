import { getSessionUser } from '@/lib/session'
import { PasswordForm } from '@/components/admin/password-form'

export const dynamic = 'force-dynamic'

export const metadata = { title: '账户安全' }

export default async function AccountPage() {
  const username = await getSessionUser()

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Account</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
          账户安全
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          当前账号：{username} · 修改密码后，其他设备需要重新登录
        </p>
      </div>
      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <PasswordForm />
      </div>
    </div>
  )
}
