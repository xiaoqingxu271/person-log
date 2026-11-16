import { adminListSubscribers } from '@/lib/subscribers'
import { SubscriberActions } from '@/components/admin/subscriber-actions'
import { formatDateTime } from '@/lib/format'
import { SITE } from '@/lib/site'
import { DownloadIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '订阅管理' }

export default async function AdminSubscribersPage() {
  const subscribers = await adminListSubscribers()
  const confirmedCount = subscribers.filter((item) => item.status === 'confirmed').length
  const pendingCount = subscribers.length - confirmedCount

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Subscribers</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            订阅管理
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            共 {subscribers.length} 位 · {confirmedCount} 已确认
            {pendingCount > 0 ? ` · ${pendingCount} 待确认` : ''} · 群发与导出仅包含已确认邮箱
          </p>
        </div>
        {confirmedCount > 0 && (
          <a
            href="/api/subscribers/export"
            download
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white transition-colors hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
          >
            <DownloadIcon className="h-4 w-4" />
            导出 CSV
          </a>
        )}
      </div>

      {subscribers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center text-stone-500 dark:border-stone-700 dark:bg-stone-900">
          还没有订阅者，前台页脚的订阅表单提交后会出现在这里。
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-left text-xs uppercase tracking-wider text-stone-400 dark:border-stone-800 dark:bg-stone-800/40">
                <th className="px-5 py-3.5 font-medium">邮箱</th>
                <th className="px-5 py-3.5 font-medium">状态</th>
                <th className="px-5 py-3.5 font-medium">订阅时间</th>
                <th className="px-5 py-3.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {subscribers.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <td className="max-w-0 truncate px-5 py-4 text-stone-700 dark:text-stone-300">
                    {item.email}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {item.status === 'confirmed' ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                        已确认
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                        待确认
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-stone-500 dark:text-stone-400">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <SubscriberActions
                      id={item.id}
                      email={item.email}
                      unsubscribeUrl={
                        item.token
                          ? `${SITE.url}/unsubscribe?token=${encodeURIComponent(item.token)}`
                          : ''
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
