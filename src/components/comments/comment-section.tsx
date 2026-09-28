'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CommentView } from '@/lib/comments'

interface Props {
  postId: number
  comments: CommentView[]
  loggedIn: boolean
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function StatusBadge({ status }: { status: CommentView['status'] }) {
  if (status === 'pending')
    return <span className="rounded bg-amber-100 px-1.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">待审</span>
  if (status === 'hidden')
    return <span className="rounded bg-neutral-200 px-1.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">已隐藏</span>
  return null
}

function Avatar({ url, name }: { url: string; name: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={`${name}的头像`} className="h-full w-full" loading="lazy" />
      ) : (
        name.slice(0, 1)
      )}
    </span>
  )
}

export function CommentSection({ postId, comments, loggedIn }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [replyTo, setReplyTo] = useState<CommentView | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const mountedAt = useRef(Date.now())
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('personlog_commenter') ?? '{}')
      if (typeof saved.name === 'string') setName(saved.name)
      if (typeof saved.email === 'string') setEmail(saved.email)
      if (typeof saved.url === 'string') setUrl(saved.url)
    } catch {
      /* 忽略损坏的本地数据 */
    }
  }, [])

  const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          parentId: replyTo?.id ?? null,
          authorName: name,
          authorEmail: email,
          authorUrl: url,
          content,
          honeypot,
          elapsedMs: Date.now() - mountedAt.current,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error ?? '提交失败，请重试' })
        return
      }
      localStorage.setItem('personlog_commenter', JSON.stringify({ name, email, url }))
      setContent('')
      setReplyTo(null)
      setMessage({
        type: 'ok',
        text: data.status === 'pending' ? '评论已提交，审核通过后将会展示' : '评论已发布',
      })
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  function renderComment(comment: CommentView, isReply: boolean) {
    const nameEl = comment.authorUrl ? (
      <a
        href={comment.authorUrl}
        target="_blank"
        rel="noreferrer nofollow"
        className="font-medium hover:underline"
      >
        {comment.authorName}
      </a>
    ) : (
      <span className="font-medium">{comment.authorName}</span>
    )
    return (
      <li key={comment.id} className={isReply ? 'pl-10' : ''}>
        <div
          className={
            'rounded-lg border p-3 ' +
            (comment.status === 'hidden'
              ? 'border-neutral-100 opacity-60 dark:border-neutral-900'
              : 'border-neutral-100 dark:border-neutral-800')
          }
        >
          <div className="flex items-center gap-2 text-sm">
            <Avatar url={comment.avatarUrl} name={comment.authorName} />
            {nameEl}
            {comment.isOwner && (
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-xs text-white">博主</span>
            )}
            <StatusBadge status={comment.status} />
            <time
              dateTime={comment.createdAtISO}
              suppressHydrationWarning
              className="text-xs text-neutral-400"
            >
              {timeLabel(comment.createdAtISO)}
            </time>
          </div>
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">
            {comment.content}
          </p>
          {!isReply && (
            <button
              type="button"
              onClick={() => {
                setReplyTo(comment)
                setMessage(null)
                formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className="mt-2 text-xs text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              回复
            </button>
          )}
        </div>
        {comment.replies.length > 0 && (
          <ul className="mt-2 space-y-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </ul>
        )}
      </li>
    )
  }

  const input =
    'w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900'

  return (
    <section className="mt-12 border-t border-neutral-100 pt-8 dark:border-neutral-800">
      <h2 className="text-xl font-bold">
        评论 <span className="text-sm font-normal text-neutral-400">{total} 条</span>
      </h2>

      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
          还没有评论，来说两句吧～
        </p>
      ) : (
        <ul className="mt-4 space-y-3">{comments.map((c) => renderComment(c, false))}</ul>
      )}

      <div ref={formRef} className="mt-8">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
          {replyTo ? `回复 @${replyTo.authorName}` : '发表评论'}
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="ml-2 text-xs font-normal text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              取消回复
            </button>
          )}
        </h3>
        {!loggedIn && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              className={input}
              placeholder="昵称 *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              aria-label="昵称"
            />
            <input
              className={input}
              placeholder="邮箱 *（不公开，仅用于头像）"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={200}
              aria-label="邮箱"
            />
            <input
              className={input}
              placeholder="网址（可选）"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              maxLength={500}
              aria-label="网址"
            />
          </div>
        )}
        {/* 蜜罐字段：对人不可见，机器人填了会被静默丢弃 */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <textarea
          className={`${input} mt-3 min-h-24 resize-y`}
          placeholder="写下你的评论…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          aria-label="评论内容"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="rounded bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {submitting ? '提交中…' : replyTo ? '回复' : '发表评论'}
          </button>
          {message && (
            <span
              className={
                'text-sm ' +
                (message.type === 'ok'
                  ? 'text-green-700 dark:text-green-500'
                  : 'text-red-600')
              }
            >
              {message.text}
            </span>
          )}
          {!loggedIn && !message && (
            <span className="text-xs text-neutral-400">评论需博主审核后展示</span>
          )}
        </div>
      </div>
    </section>
  )
}
