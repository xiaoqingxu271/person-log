'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

/** 说说发布器：正文 + 可选配图（走图片上传接口） */
export function MomentComposer() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadImage(file: File) {
    setBusy(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/uploads', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '图片上传失败')
        return
      }
      setImageUrl(data.url)
    } finally {
      setBusy(false)
    }
  }

  async function submit() {
    if (!content.trim()) {
      setError('说说什么吧～')
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '发布失败')
        return
      }
      setContent('')
      setImageUrl('')
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  const input =
    'w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-900'

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
      <textarea
        className={`${input} min-h-24 resize-y`}
        placeholder="记录此刻的想法…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
      />
      {imageUrl && (
        <div className="mt-3 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="配图预览" className="h-16 w-16 rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => setImageUrl('')}
            className="text-xs text-stone-400 hover:text-red-600"
          >
            移除图片
          </button>
        </div>
      )}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="rounded-full border border-stone-300 px-3 py-1.5 text-xs text-stone-600 transition-colors hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          {busy ? '处理中…' : '添加配图'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) uploadImage(e.target.files[0])
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-full bg-stone-900 px-5 py-1.5 text-sm text-white transition-colors hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
        >
          发布
        </button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
