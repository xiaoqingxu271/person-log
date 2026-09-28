import { getSiteConfig } from '@/lib/site-config'
import { SettingsForm } from '@/components/admin/settings-form'

export const dynamic = 'force-dynamic'

export const metadata = { title: '站点设置' }

export default async function SettingsPage() {
  const cfg = await getSiteConfig()
  return <SettingsForm initial={cfg} />
}
