'use client'

import { useEffect, useState } from 'react'

const LIKED_KEY = 'personlog_liked_posts'

function getLikedIds(): number[] {
  try {
    const raw = localStorage.getItem(LIKED_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/** 点赞按钮：同一浏览器对同一篇文章只计一次（localStorage 防重复） */
export function LikeButton({ postId, initialLikes }: { postId: number; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // 挂载后读取 localStorage 的点赞记录，避免 SSR/CSR 不一致
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(getLikedIds().includes(postId))
  }, [postId])

  async function like() {
    if (liked || busy) return
    setBusy(true)
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes)
        setLiked(true)
        localStorage.setItem(LIKED_KEY, JSON.stringify([...getLikedIds(), postId]))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={like}
      disabled={liked || busy}
      title={liked ? '已点赞' : '点赞支持'}
      className={
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ' +
        (liked
          ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400'
          : 'border-stone-300 text-stone-600 hover:border-red-300 hover:text-red-600 dark:border-stone-700 dark:text-stone-300 dark:hover:border-red-900 dark:hover:text-red-400')
      }
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
      </svg>
      {likes > 0 ? `${likes} 个赞` : '点赞'}
    </button>
  )
}
