import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { LoginForm } from '@/components/admin/login-form'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata = { title: '登录' }

export default async function LoginPage() {
  if (await getSessionUser()) redirect('/admin/posts')

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-center text-xl font-bold">{SITE.name} · 后台登录</h1>
        <p className="mt-2 text-center text-sm text-neutral-500">仅博主本人可登录</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
