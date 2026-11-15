'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LikeButton } from '@/components/like-button'
import { CalendarIcon, LinkIcon } from '@/components/icons'
import { formatDate } from '@/lib/format'

export interface MomentView {
  id: number
  content: string
  imageUrl: string
  likes: number
  createdAtISO: string
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  if (hours < 48) return `昨天 ${hh}:${mm}`
  return formatDate(iso)
}

/** 说说卡片：头像/昵称/相对时间 + 正文 + 缩略图 + 点赞/分享 + 更多菜单 */
export function MomentCard({
  moment,
  ownerName,
  ownerAvatar,
  siteName,
}: {
  moment: MomentView
  ownerName: string
  ownerAvatar: string
  siteName: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    const url = `${location.origin}/moments#moment-${moment.id}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
    setMenuOpen(false)
  }

  return (
    <article id={`moment-${moment.id}`} className="glass-panel animate-fade-up scroll-mt-28 rounded-2xl p-5">
      <div className="flex items-center gap-3">
        <Image
          src={ownerAvatar}
          alt={`${ownerName}的头像`}
          width={40}
          height={40}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-ice-400/40"
        />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-white">{ownerName}</p>
          <p className="font-script truncate text-xs text-slate-500">{siteName}</p>
        </div>
        <time
          dateTime={moment.createdAtISO}
          suppressHydrationWarning
          className="shrink-0 text-xs text-slate-500"
        >
          {timeAgo(moment.createdAtISO)}
        </time>
        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="更多操作"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-full px-2 py-1 text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </button>
          {menuOpen && (
            <div className="glass-bar absolute right-0 top-8 z-20 w-32 rounded-xl p-1.5">
              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-200 transition-colors hover:bg-white/8 hover:text-ice-300"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                {copied ? '已复制' : '复制链接'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3.5 flex gap-4">
        <p className="min-w-0 flex-1 whitespace-pre-line break-words text-sm leading-relaxed text-slate-200">
          {moment.content}
        </p>
        {moment.imageUrl && (
          <a
            href={moment.imageUrl}
            target="_blank"
            rel="noreferrer"
            className="relative block h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-white/10"
            aria-label="查看说说图片"
          >
            <Image
              src={moment.imageUrl}
              alt=""
              fill
              sizes="128px"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </a>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] text-slate-400">
          <CalendarIcon className="h-3 w-3" />
          {formatDate(moment.createdAtISO)}
        </span>
        <div className="flex items-center gap-2.5">
          <LikeButton postId={moment.id} initialLikes={moment.likes} kind="moment" />
          <button
            type="button"
            onClick={copyLink}
            className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm text-slate-300 transition-colors hover:border-ice-400/40 hover:text-ice-300"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            {copied ? '已复制' : '分享'}
          </button>
        </div>
      </div>
    </article>
  )
}