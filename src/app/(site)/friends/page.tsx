import { listVisibleFriends } from '@/lib/friends'
import { PageCard, PageHeader } from '@/components/page-card'
import { LinkIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '友链' }

export default async function FriendsPage() {
  const friends = await listVisibleFriends()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader
          eyebrow="Links"
          title="友情链接"
          description={`共 ${friends.length} 个站点 · 想交换友链欢迎在评论区留言`}
        />
        {friends.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">还没有友链，快来第一个交换吧。</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {friends.map((friend) => (
              <a
                key={friend.id}
                href={friend.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900 dark:hover:border-orange-800"
              >
                <span className="flex h-12 w-12 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-stone-100 text-lg font-bold text-stone-400 dark:bg-stone-800 dark:text-stone-500">
                  {friend.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={friend.avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    friend.name.slice(0, 1)
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-medium text-stone-900 transition-colors group-hover:text-orange-600 dark:text-stone-100 dark:group-hover:text-orange-400">
                    {friend.name}
                    <LinkIcon className="h-3 w-3 shrink-0 text-stone-300 transition-colors group-hover:text-orange-400 dark:text-stone-600" />
                  </span>
                  <span className="block truncate text-sm text-stone-400 dark:text-stone-500">
                    {friend.description || friend.url}
                  </span>
                </span>
              </a>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
