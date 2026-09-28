'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** 单条友链的显示/隐藏与删除操作 */
export function FriendActions({ id, isVisible }: { id: number; isVisible: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    try {
      const res = await fetch(`/api/friends/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !isVisible }),
      })
      if (res.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!confirm(`确定删除该友链？`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/friends/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={
          'transition-colors hover:underline disabled:opacity-50 ' +
          (isVisible ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400')
        }
      >
        {isVisible ? '显示中' : '已隐藏'}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="text-red-600 transition-colors hover:underline disabled:opacity-50 dark:text-red-500"
      >
        删除
      </button>
    </div>
  )
}
