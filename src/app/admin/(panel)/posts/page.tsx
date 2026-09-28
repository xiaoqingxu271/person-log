import Link from 'next/link'
import { adminListPosts } from '@/lib/posts'
import { DeletePostButton } from '@/components/admin/delete-post-button'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: '文章管理' }

export default async function AdminPostsPage() {
  const posts = await adminListPosts()

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">文章管理</h1>
        <Link
          href="/admin/posts/new"
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          写文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-neutral-500">
          还没有文章，点右上角「写文章」开始创作。
        </p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <th className="py-2 pr-4 font-medium">标题</th>
              <th className="py-2 pr-4 font-medium">状态</th>
              <th className="py-2 pr-4 font-medium">分类</th>
              <th className="py-2 pr-4 font-medium">更新时间</th>
              <th className="py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-neutral-100 dark:border-neutral-800">
                <td className="py-2.5 pr-4">
                  <Link href={`/admin/posts/${post.id}/edit`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                  {post.isPinned && <span className="ml-2 text-xs text-red-600 dark:text-red-500">置顶</span>}
                </td>
                <td className="py-2.5 pr-4">
                  {post.status === 'published' ? (
                    <span className="text-green-700 dark:text-green-500">已发布</span>
                  ) : (
                    <span className="text-neutral-400">草稿</span>
                  )}
                </td>
                <td className="py-2.5 pr-4 text-neutral-500 dark:text-neutral-400">{post.category?.name ?? '—'}</td>
                <td className="py-2.5 pr-4 text-neutral-500 dark:text-neutral-400">{formatDate(post.updatedAt)}</td>
                <td className="py-2.5">
                  <span className="flex gap-3">
                    <Link href={`/admin/posts/${post.id}/edit`} className="text-blue-600 hover:underline">
                      编辑
                    </Link>
                    {post.status === 'published' && (
                      <Link href={`/posts/${post.slug}`} target="_blank" className="text-neutral-500 hover:underline">
                        查看
                      </Link>
                    )}
                    <DeletePostButton id={post.id} title={post.title} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
