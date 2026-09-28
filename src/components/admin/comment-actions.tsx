'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CommentActionsProps {
  id: number
  postId: number
  status: 'pending' | 'approved' | 'hidden'
  canReply: boolean
}

export function CommentActions({ id, postId, status, canReply }: CommentActionsProps) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState('')
  const [error, setError] = useState('')

  async function changeStatus(next: 'approved' | 'hidden') {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) router.refresh()
      else setError('操作失败')
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm('确定删除这条评论？其楼中楼回复会一并删除。')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
      else setError('删除失败')
    } finally {
      setBusy(false)
    }
  }

  async function submitReply() {
    if (!reply.trim()) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, parentId: id, content: reply }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setReply('')
        setReplying(false)
        router.refresh()
      } else {
        setError(data.error ?? '回复失败')
      }
    } finally {
      setBusy(false)
    }
  }

  const btn =
    'text-xs transition-colors disabled:opacity-50 hover:underline disabled:no-underline'

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {status !== 'approved' && (
          <button type="button" onClick={() => changeStatus('approved')} disabled={busy} className={`${btn} text-green-700 dark:text-green-500`}>
            {status === 'hidden' ? '恢复显示' : '通过'}
          </button>
        )}
        {status === 'approved' && (
          <button type="button" onClick={() => changeStatus('hidden')} disabled={busy} className={`${btn} text-amber-700 dark:text-amber-500`}>
            隐藏
          </button>
        )}
        {canReply && (
          <button type="button" onClick={() => setReplying((v) => !v)} disabled={busy} className={`${btn} text-blue-600`}>
            {replying ? '收起' : '回复'}
          </button>
        )}
        <button type="button" onClick={remove} disabled={busy} className={`${btn} text-red-600`}>
          删除
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
      {replying && (
        <div className="space-y-2">
          <textarea
            className="min-h-16 w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="以博主身份回复（直接展示，无需审核）"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            maxLength={2000}
          />
          <button
            type="button"
            onClick={submitReply}
            disabled={busy || !reply.trim()}
            className="rounded bg-neutral-900 px-3 py-1.5 text-xs text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
          >
            发送回复
          </button>
        </div>
      )}
    </div>
  )
}
