import Link from 'next/link'
import { adminListPosts } from '@/lib/posts'
import { isPostScheduled } from '@/lib/post-visibility'
import { DeletePostButton } from '@/components/admin/delete-post-button'
import { NotifySubscribersButton } from '@/components/admin/notify-subscribers-button'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: '文章管理' }

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function AdminPostsPage({ searchParams }: Props) {
  const query = await searchParams
  const q = (query.q ?? '').trim().slice(0, 100)
  const status =
    query.status === 'draft' || query.status === 'published' ? query.status : 'all'
  const posts = await adminListPosts({ q, status })
  const publishedCount = posts.filter((p) => p.status === 'published').length
  const filtered = q !== '' || status !== 'all'

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Posts</p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
            文章管理
          </h1>
          <p className="mt-1 text-sm text-stone-400">
            {filtered ? '筛选结果：' : '共 '}
            {posts.length} 篇 · {publishedCount} 篇已发布
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white transition-colors hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
        >
          写文章
        </Link>
      </div>

      <form
        action="/admin/posts"
        method="get"
        className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="搜索标题、slug 或摘要"
          aria-label="搜索文章"
          className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-950"
        />
        <select
          name="status"
          defaultValue={status}
          aria-label="状态筛选"
          className="rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-950"
        >
          <option value="all">全部状态</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-stone-900 px-4 py-2 text-sm text-white transition-colors hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
        >
          筛选
        </button>
        {filtered && (
          <Link
            href="/admin/posts"
            className="rounded-xl px-3 py-2 text-sm text-stone-500 transition-colors hover:text-stone-800 dark:hover:text-stone-200"
          >
            重置
          </Link>
        )}
      </form>

      {posts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center text-stone-500 dark:border-stone-700 dark:bg-stone-900">
          {filtered ? (
            <p>
              没有匹配的文章，
              <Link href="/admin/posts" className="text-orange-600 hover:underline dark:text-orange-400">
                清除筛选
              </Link>
            </p>
          ) : (
            '还没有文章，点右上角「写文章」开始创作。'
          )}
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-left text-xs uppercase tracking-wider text-stone-400 dark:border-stone-800 dark:bg-stone-800/40">
                <th className="px-5 py-3.5 font-medium">标题</th>
                <th className="px-5 py-3.5 font-medium">状态</th>
                <th className="px-5 py-3.5 font-medium">分类</th>
                <th className="px-5 py-3.5 font-medium">更新时间</th>
                <th className="px-5 py-3.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="font-medium text-stone-900 transition-colors hover:text-orange-600 dark:text-stone-100 dark:hover:text-orange-400"
                    >
                      {post.title}
                    </Link>
                    {post.isPinned && (
                      <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600 dark:bg-red-950 dark:text-red-400">
                        置顶
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {post.status === 'published' ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          已发布
                        </span>
                        {isPostScheduled(post) && (
                          <span
                            className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                            title={`定时于 ${post.publishedAt?.toLocaleString('zh-CN')}`}
                          >
                            定时
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                        草稿
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-stone-500 dark:text-stone-400">
                    {post.category?.name ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-stone-500 dark:text-stone-400">
                    {formatDate(post.updatedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex gap-3 text-xs">
                      <Link href={`/admin/posts/${post.id}/edit`} className="text-orange-600 hover:underline dark:text-orange-400">
                        编辑
                      </Link>
                      {post.status === 'published' && (
                        <Link href={`/posts/${post.slug}`} target="_blank" className="text-stone-400 hover:underline">
                          查看
                        </Link>
                      )}
                      {post.status === 'published' && !isPostScheduled(post) && (
                        <NotifySubscribersButton id={post.id} title={post.title} />
                      )}
                      <DeletePostButton id={post.id} title={post.title} />
                    </span>
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
