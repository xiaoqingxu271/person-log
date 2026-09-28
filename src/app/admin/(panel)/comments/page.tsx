import Link from 'next/link'
import { adminListComments } from '@/lib/comments'
import { CommentActions } from '@/components/admin/comment-actions'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: '评论管理' }

const statusBadge = {
  pending: 'rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  approved: 'rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700 dark:bg-green-950 dark:text-green-500',
  hidden: 'rounded bg-neutral-200 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
}

export default async function AdminCommentsPage() {
  const comments = await adminListComments()

  return (
    <div>
      <h1 className="text-xl font-bold">评论管理</h1>

      {comments.length === 0 ? (
        <p className="mt-12 text-center text-neutral-500">还没有收到任何评论。</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className={
                'rounded-lg border p-4 ' +
                (comment.status === 'hidden'
                  ? 'border-neutral-100 opacity-70 dark:border-neutral-900'
                  : 'border-neutral-200 dark:border-neutral-800')
              }
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={statusBadge[comment.status]}>
                  {comment.status === 'pending' ? '待审' : comment.status === 'approved' ? '已通过' : '已隐藏'}
                </span>
                <span className="font-medium">{comment.authorName}</span>
                {comment.isOwner && (
                  <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">博主</span>
                )}
                {!comment.isOwner && (
                  <span className="text-xs text-neutral-400">
                    {comment.authorEmail} · IP {comment.ip || '未知'}
                  </span>
                )}
                {comment.parent && (
                  <span className="text-xs text-neutral-400">回复 @{comment.parent.authorName}</span>
                )}
                <span className="text-xs text-neutral-400">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
                {comment.content}
              </p>
              <div className="mt-2 text-xs text-neutral-400">
                文章：
                <Link href={`/posts/${comment.post.slug}`} target="_blank" className="hover:underline">
                  {comment.post.title}
                </Link>
              </div>
              <div className="mt-3">
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
