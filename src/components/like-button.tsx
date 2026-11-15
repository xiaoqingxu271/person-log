'use client'

import { useEffect, useState } from 'react'
import { HeartIcon } from '@/components/icons'

const LIKED_KEY = 'personlog_liked_posts'
const LIKED_MOMENT_KEY = 'personlog_liked_moments'

function getLikedIds(key: string): number[] {
  try {
    const raw = localStorage.getItem(key)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

/** 点赞按钮：同一浏览器对同一目标只计一次（localStorage 防重复） */
export function LikeButton({
  postId,
  initialLikes,
  variant = 'chip',
  kind = 'post',
}: {
  postId: number
  initialLikes: number
  variant?: 'chip' | 'pill'
  kind?: 'post' | 'moment'
}) {
  const storageKey = kind === 'moment' ? LIKED_MOMENT_KEY : LIKED_KEY
  const apiPath = kind === 'moment' ? `/api/moments/${postId}/like` : `/api/posts/${postId}/like`
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // 挂载后读取 localStorage 的点赞记录，避免 SSR/CSR 不一致
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(getLikedIds(storageKey).includes(postId))
  }, [postId, storageKey])

  async function like() {
    if (liked || busy) return
    setBusy(true)
    try {
      const res = await fetch(apiPath, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLikes(data.likes)
        setLiked(true)
        localStorage.setItem(storageKey, JSON.stringify([...getLikedIds(storageKey), postId]))
      }
    } finally {
      setBusy(false)
    }
  }

  const label = liked ? `${likes} 个赞` : variant === 'pill' ? '点赞' : likes > 0 ? `${likes} 个赞` : '点赞'

  return (
    <button
      type="button"
      onClick={like}
      disabled={liked || busy}
      title={liked ? '已点赞' : '点赞支持'}
      className={
        variant === 'pill'
          ? 'aurora-btn inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium disabled:opacity-80'
          : 'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-all ' +
            (liked
              ? 'border-flare-400/40 bg-flare-400/15 text-flare-300 shadow-[0_0_18px_rgba(232,121,249,0.25)]'
              : 'glass-chip text-slate-300 hover:border-flare-400/40 hover:text-flare-300')
      }
    >
      <HeartIcon className="h-4 w-4" filled={liked || variant === 'pill'} />
      {label}
    </button>
  )
}