'use client'

import { useState } from 'react'

export function NotifySubscribersButton({ id, title }: { id: number; title: string }) {
  const [busy, setBusy] = useState(false)
  const [label, setLabel] = useState('推送订阅')
  const [detail, setDetail] = useState('')

  async function handleNotify() {
    if (!confirm(`向所有邮箱订阅者发送《${title}》的更新邮件？`)) return
    setBusy(true)
    setDetail('')
    try {
      const res = await fetch(`/api/posts/${id}/notify`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLabel('推送失败')
        setDetail(typeof data.error === 'string' ? data.error : '发送失败，请重试')
        return
      }
      setLabel(`已通知 ${data.sent} 人`)
      setDetail(
        `共 ${data.total} 位订阅者，成功 ${data.sent}，失败 ${data.failed}，跳过 ${data.skipped}`,
      )
    } catch {
      setLabel('推送失败')
      setDetail('网络异常，请重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleNotify}
      disabled={busy}
      title={detail}
      className="text-stone-500 hover:underline disabled:opacity-50"
    >
      {busy ? '发送中…' : label}
    </button>
  )
}
