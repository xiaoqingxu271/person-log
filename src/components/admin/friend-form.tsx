'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/** 新增友链表单 */
export function FriendForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', url: '', avatar: '', description: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function submit() {
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error ?? '添加失败' })
        return
      }
      setForm({ name: '', url: '', avatar: '', description: '' })
      setMessage({ type: 'ok', text: '已添加' })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const input =
    'w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-900'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          className={input}
          placeholder="站点名称 *"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          maxLength={50}
        />
        <input
          className={input}
          placeholder="站点网址 *（http(s):// 开头）"
          value={form.url}
          onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
          maxLength={500}
        />
        <input
          className={input}
          placeholder="头像图片 URL（可选）"
          value={form.avatar}
          onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
          maxLength={500}
        />
        <input
          className={input}
          placeholder="一句话介绍（可选）"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          maxLength={500}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-stone-900 px-5 py-1.5 text-sm text-white transition-colors hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
        >
          {busy ? '添加中…' : '添加友链'}
        </button>
        {message && (
          <span className={`text-sm ${message.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
            {message.text}
          </span>
        )}
      </div>
    </form>
  )
}
