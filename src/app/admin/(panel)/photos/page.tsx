import { adminListPhotos } from '@/lib/photos'
import { PhotoManager } from '@/components/admin/photo-manager'

export const dynamic = 'force-dynamic'

export const metadata = { title: '相册管理' }

export default async function AdminPhotosPage() {
  const items = await adminListPhotos()

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Gallery</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">相册管理</h1>
        <p className="mt-1 text-sm text-stone-400">共 {items.length} 张照片 · 隐藏的照片不会出现在前台</p>
      </div>

      <div className="mt-8">
        <PhotoManager items={items} />
      </div>
    </div>
  )
}