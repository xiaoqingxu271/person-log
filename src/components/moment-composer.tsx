'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRightIcon } from '@/components/icons'

/** 说说发布器：博主登录后可发布；游客看到登录引导 */
export function MomentComposer({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [showImage, setShowImage] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  if (!loggedIn) {
    return (
      <div className="glass-bar flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4">
        <p className="text-sm text-slate-400">
          分享你的瞬间…
          <span className="font-script ml-2 block text-xs text-slate-500">Share your moment...</span>
        </p>
        <Link
          href="/admin/login"
          className="aurora-btn inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
        >
          登录发布
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  async function submit() {
    if (!content.trim() || busy) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl: imageUrl || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? '发布失败，请重试' })
        return
      }
      setContent('')
      setImageUrl('')
      setShowImage(false)
      setMessage({ ok: true, text: '发布成功 ✨' })
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="glass-bar rounded-2xl p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={1000}
        placeholder="分享你的瞬间..."
        aria-label="说说内容"
        className="min-h-20 w-full resize-y bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
      />
      {showImage && (
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          maxLength={500}
          placeholder="图片地址（可选）"
          aria-label="图片地址"
          className="glass-input mt-2"
        />
      )}
      <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
        <button
          type="button"
          onClick={() => setShowImage((v) => !v)}
          title="添加图片"
          aria-pressed={showImage}
          className={
            'rounded-full p-2 transition-colors ' +
            (showImage ? 'bg-ice-400/20 text-ice-300' : 'text-slate-400 hover:bg-white/5 hover:text-ice-300')
          }
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </button>
        {message && (
          <span role="status" className={'text-xs ' + (message.ok ? 'text-aurora-300' : 'text-flare-300')}>
            {message.text}
          </span>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={busy || !content.trim()}
          className="aurora-btn ml-auto rounded-full px-6 py-2 text-sm font-medium disabled:opacity-50"
        >
          {busy ? '发布中…' : '发布'}
        </button>
      </div>
    </div>
  )
}