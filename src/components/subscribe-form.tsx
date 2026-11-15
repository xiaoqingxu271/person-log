'use client'

import { useState } from 'react'

/** 邮箱订阅：POST /api/subscribe，成功/失败均有内联反馈 */
export function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? '订阅失败，请稍后再试' })
        return
      }
      setMessage({ ok: true, text: '订阅成功，新文章会第一时间送达你的邮箱 ✨' })
      setEmail('')
    } catch {
      setMessage({ ok: false, text: '网络异常，请稍后再试' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="输入邮箱地址"
          aria-label="订阅邮箱"
          maxLength={200}
          className="glass-input h-10 min-w-0 flex-1 rounded-full px-4"
        />
        <button
          type="submit"
          disabled={busy}
          className="aurora-btn h-10 shrink-0 rounded-full px-5 text-sm font-medium"
        >
          {busy ? '订阅中…' : '订阅'}
        </button>
      </div>
      <p
        role="status"
        className={
          'mt-1.5 min-h-4 text-xs ' +
          (message ? (message.ok ? 'text-aurora-300' : 'text-flare-300') : 'text-transparent')
        }
      >
        {message?.text ?? '占位'}
      </p>
    </form>
  )
}