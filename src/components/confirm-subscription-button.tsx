'use client'

import Link from 'next/link'
import { useState } from 'react'

export function ConfirmSubscriptionButton({ token }: { token: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function confirm() {
    setState('busy')
    setMessage('')
    try {
      const res = await fetch('/api/subscribe/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setState('error')
        setMessage(typeof data.error === 'string' ? data.error : '确认失败，请稍后再试')
        return
      }
      setState('done')
    } catch {
      setState('error')
      setMessage('网络异常，请稍后再试')
    }
  }

  if (state === 'done') {
    return (
      <div>
        <p className="text-sm text-aurora-300">订阅已确认，新文章发布会通过邮件通知你。</p>
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
    <div>
      <button
        type="button"
        onClick={confirm}
        disabled={state === 'busy'}
        className="aurora-btn rounded-full px-6 py-2.5 text-sm font-medium disabled:opacity-60"
      >
        {state === 'busy' ? '确认中…' : '确认订阅'}
      </button>
      {message && (
        <p role="status" className="mt-3 text-sm text-flare-300">
          {message}
        </p>
      )}
    </div>
  )
}
