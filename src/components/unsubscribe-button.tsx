'use client'

import { useState } from 'react'
import Link from 'next/link'

export function UnsubscribeButton({ token }: { token: string }) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function confirm() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/subscribe/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? '退订失败，请稍后再试')
        return
      }
      setDone(true)
    } catch {
      setError('网络异常，请稍后再试')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-sm text-slate-300">已成功退订，后续不会再收到更新通知。</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-white px-5 py-2 text-sm font-medium text-night-950 transition-colors hover:bg-slate-200"
        >
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm text-slate-400">
        退订后将删除你的邮箱记录，且无法恢复。
      </p>
      <button
        type="button"
        onClick={confirm}
        disabled={busy}
        className="aurora-btn mt-6 rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {busy ? '处理中…' : '确认退订'}
      </button>
      {error && <p className="mt-4 text-sm text-flare-300">{error}</p>}
    </div>
  )
}
