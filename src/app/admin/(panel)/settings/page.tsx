import { getSiteConfig } from '@/lib/site-config'
import { SettingsForm } from '@/components/admin/settings-form'

export const dynamic = 'force-dynamic'

export const metadata = { title: '站点设置' }

export default async function SettingsPage() {
  const cfg = await getSiteConfig()

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Settings</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
          站点设置
        </h1>
        <p className="mt-1 text-sm text-stone-400">保存后前台即时生效</p>
      </div>
      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <SettingsForm initial={cfg} />
      </div>
    </div>
  )
}
