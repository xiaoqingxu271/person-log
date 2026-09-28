import Link from 'next/link'
import { adminListComments } from '@/lib/comments'
import { CommentActions } from '@/components/admin/comment-actions'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: '评论管理' }

const statusBadge = {
  pending: 'rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  approved: 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  hidden: 'rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400',
}

export default async function AdminCommentsPage() {
  const comments = await adminListComments()
  const pendingCount = comments.filter((c) => c.status === 'pending').length

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Comments</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
          评论管理
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          共 {comments.length} 条{pendingCount > 0 && ` · ${pendingCount} 条待审`}
        </p>
      </div>

      {comments.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white py-20 text-center text-stone-500 dark:border-stone-700 dark:bg-stone-900">
          还没有收到任何评论。
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className={
                'rounded-2xl border bg-white p-5 dark:bg-stone-900 ' +
                (comment.status === 'hidden'
                  ? 'border-stone-100 opacity-70 dark:border-stone-800/50'
                  : 'border-stone-200 dark:border-stone-800')
              }
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={statusBadge[comment.status]}>
                  {comment.status === 'pending' ? '待审' : comment.status === 'approved' ? '已通过' : '已隐藏'}
                </span>
                <span className="font-medium text-stone-900 dark:text-stone-100">{comment.authorName}</span>
                {comment.isOwner && (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                    博主
                  </span>
                )}
                {!comment.isOwner && (
                  <span className="text-xs text-stone-400">
                    {comment.authorEmail} · IP {comment.ip || '未知'}
                  </span>
                )}
                {comment.parent && (
                  <span className="text-xs text-stone-400">回复 @{comment.parent.authorName}</span>
                )}
                <span className="text-xs text-stone-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="mt-2.5 whitespace-pre-line break-words text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                {comment.content}
              </p>
              <div className="mt-2 text-xs text-stone-400">
                文章：
                <Link href={`/posts/${comment.post.slug}`} target="_blank" className="transition-colors hover:text-orange-600 dark:hover:text-orange-400">
                  {comment.post.title}
                </Link>
              </div>
              <div className="mt-3 border-t border-stone-100 pt-3 dark:border-stone-800">
                <CommentActions
                  id={comment.id}
                  postId={comment.postId}
                  status={comment.status}
                  canReply={comment.parentId === null}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
