import { adminListMusic } from '@/lib/music'
import { MusicManager } from '@/components/admin/music-manager'

export const dynamic = 'force-dynamic'

export const metadata = { title: '音乐库管理' }

export default async function AdminMusicPage() {
  const items = await adminListMusic()

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Music</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">音乐库管理</h1>
        <p className="mt-1 text-sm text-stone-400">共 {items.length} 张专辑 · 隐藏的专辑不会出现在前台</p>
      </div>

      <div className="mt-8">
        <MusicManager items={items} />
      </div>
    </div>
  )
}