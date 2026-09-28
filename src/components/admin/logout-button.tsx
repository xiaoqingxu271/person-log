'use client'

import { useRouter } from 'next/navigation'
import { LogoutIcon } from '@/components/icons'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/admin/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title="退出登录"
      aria-label="退出登录"
      className="rounded-lg p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200"
    >
      <LogoutIcon className="h-4 w-4" />
    </button>
  )
}
