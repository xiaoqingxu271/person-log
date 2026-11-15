'use client'

import { useState } from 'react'
import { ArrowRightIcon } from '@/components/icons'

export interface FriendItem {
  id: number
  name: string
  url: string
  avatar: string
  description: string
}

const PER_PAGE = 8

/** 友链卡片网格 + 圆点分页（每页 8 个） */
export function FriendsPager({ friends }: { friends: FriendItem[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(friends.length / PER_PAGE))
  const current = Math.min(page, totalPages - 1)
  const visible = friends.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE)

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((friend, index) => (
          <a
            key={friend.id}
            href={friend.url}
            target="_blank"
            rel="noreferrer"
            className="glass-panel animate-fade-up group flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:glow-ring"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start gap-4">
              <span className="relative block h-14 w-14 shrink-0">
                <span aria-hidden className="absolute inset-0 rounded-full bg-gradient-to-br from-ice-400 to-nebula-500 opacity-70 blur-[5px] transition-opacity group-hover:opacity-100" />
                {friend.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={friend.avatar}
                    alt=""
                    loading="lazy"
                    className="relative h-14 w-14 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <span className="font-serif-cn relative flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-night-700 to-night-800 text-lg font-bold text-ice-200">
                    {friend.name.slice(0, 1)}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-serif-cn block truncate text-lg font-bold text-white transition-colors group-hover:text-aurora-300">
                  {friend.name}
                </span>
                <span className="mt-1.5 line-clamp-2 block text-xs leading-relaxed text-slate-400">
                  {friend.description || friend.url}
                </span>
              </span>
            </div>
            <span className="mt-4 flex justify-end">
              <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs text-slate-200 transition-colors group-hover:border-ice-400/50 group-hover:text-ice-300">
                访问
                <ArrowRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </a>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2.5" role="tablist" aria-label="友链分页">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`第 ${i + 1} 页`}
              onClick={() => setPage(i)}
              className={
                'h-2 rounded-full transition-all ' +
                (i === current
                  ? 'w-6 bg-gradient-to-r from-aurora-400 to-ice-400'
                  : 'w-2 bg-white/20 hover:bg-white/40')
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}