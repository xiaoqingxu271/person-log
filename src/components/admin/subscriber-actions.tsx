'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SubscriberActions({
  id,
  email,
  unsubscribeUrl,
}: {
  id: number
  email: string
  unsubscribeUrl: string
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  async function copyLink() {
    if (!unsubscribeUrl) return
    try {
      await navigator.clipboard.writeText(unsubscribeUrl)
    } catch {
      const el = document.createElement('textarea')
      el.value = unsubscribeUrl
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      el.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  async function remove() {
    if (!window.confirm(`确定移除订阅者「${email}」？`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        window.alert(data.error ?? '删除失败，请重试')
        return
      }
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="flex shrink-0 gap-3 text-xs">
      <button
        type="button"
        onClick={copyLink}
        disabled={!unsubscribeUrl}
        className="text-stone-500 transition-colors hover:text-orange-600 disabled:opacity-40 dark:text-stone-400 dark:hover:text-orange-400"
      >
        {copied ? '已复制' : '退订链接'}
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="text-red-500 transition-colors hover:text-red-600 disabled:opacity-40 dark:text-red-400"
      >
        删除
      </button>
    </span>
  )
}
