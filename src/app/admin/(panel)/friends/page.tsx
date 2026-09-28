import { adminListFriends } from '@/lib/friends'
import { FriendForm } from '@/components/admin/friend-form'
import { FriendActions } from '@/components/admin/friend-actions'

export const dynamic = 'force-dynamic'

export const metadata = { title: '友链管理' }

export default async function AdminFriendsPage() {
  const friends = await adminListFriends()

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Links</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
          友链管理
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          共 {friends.length} 个 · 隐藏的友链不会出现在前台
        </p>
      </div>

      <div className="mt-8">
        <FriendForm />
      </div>

      {friends.length === 0 ? (
        <p className="mt-10 text-center text-stone-400">还没有友链，用上方表单添加第一个。</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className={
                'flex items-center gap-4 rounded-2xl border bg-white p-4 dark:bg-stone-900 ' +
                (friend.isVisible
                  ? 'border-stone-200 dark:border-stone-800'
                  : 'border-dashed border-stone-300 opacity-60 dark:border-stone-700')
              }
            >
              <span className="flex h-11 w-11 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-stone-100 font-bold text-stone-400 dark:bg-stone-800 dark:text-stone-500">
                {friend.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={friend.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  friend.name.slice(0, 1)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                  {friend.name}
                  <span className="ml-2 text-xs font-normal text-stone-400">{friend.url}</span>
                </p>
                {friend.description && (
                  <p className="truncate text-xs text-stone-400">{friend.description}</p>
                )}
              </div>
              <FriendActions id={friend.id} isVisible={friend.isVisible} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
