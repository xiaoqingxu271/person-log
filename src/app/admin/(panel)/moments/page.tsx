import { adminListMoments } from '@/lib/moments'
import { MomentComposer } from '@/components/admin/moment-composer'
import { MomentDeleteButton } from '@/components/admin/moment-delete-button'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: '说说管理' }

export default async function AdminMomentsPage() {
  const moments = await adminListMoments()

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Moments</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
          说说管理
        </h1>
        <p className="mt-1 text-sm text-stone-400">共 {moments.length} 条 · 发布后即时显示在前台「说说」页</p>
      </div>

      <div className="mt-8">
        <MomentComposer />
      </div>

      {moments.length === 0 ? (
        <p className="mt-10 text-center text-stone-400">还没有发布过说说。</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {moments.map((moment) => (
            <li
              key={moment.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
            >
              <p className="whitespace-pre-line break-words text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                {moment.content}
              </p>
              {moment.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={moment.imageUrl}
                  alt=""
                  className="mt-3 h-20 w-20 rounded-lg object-cover"
                />
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
                <span>{formatDate(moment.createdAt)}</span>
                <MomentDeleteButton id={moment.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
