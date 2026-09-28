import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { LoginForm } from '@/components/admin/login-form'
import { LogoMark } from '@/components/logo-mark'
import { getSiteConfig } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

export const metadata = { title: '登录' }

export default async function LoginPage() {
  if (await getSessionUser()) redirect('/admin/posts')
  const cfg = await getSiteConfig()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 px-4 dark:bg-stone-950">
      {/* 背景暖色光斑 */}
      <div aria-hidden className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl dark:bg-orange-900/20" />
      <div aria-hidden className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl dark:bg-stone-800/40" />

      <div className="relative w-full max-w-sm rounded-3xl border border-stone-200/70 bg-white p-8 shadow-xl shadow-stone-900/[0.06] dark:border-stone-800 dark:bg-stone-900 dark:shadow-black/30">
        <div className="flex flex-col items-center">
          <LogoMark className="h-14 w-14" />
          <h1 className="mt-4 text-xl font-bold tracking-tight text-stone-900 dark:text-white">
            {cfg.siteName}
          </h1>
          <p className="mt-1 text-sm text-stone-400">管理后台登录</p>
        </div>
        <div className="mt-8">
          <LoginForm />
        </div>
        <Link
          href="/"
          className="mt-6 block text-center text-xs text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
        >
          ← 返回前台首页
        </Link>
      </div>
    </div>
  )
}
