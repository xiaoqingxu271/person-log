import { listVisibleFriends } from '@/lib/friends'
import { getSiteConfig } from '@/lib/site-config'
import { FriendsPager } from '@/components/friends-pager'
import { ArrowRightIcon, SparkleIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '友链' }

export default async function FriendsPage() {
  const [friends, cfg] = await Promise.all([listVisibleFriends(), getSiteConfig()])
  const mailto = cfg.email
    ? `mailto:${cfg.email}?subject=${encodeURIComponent('友链交换申请')}`
    : '/about'

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 py-10 sm:px-4">
      {/* 英雄区：Welcome to 友链 Links */}
      <header className="animate-fade-up text-center">
        <p className="font-script text-2xl text-slate-200">Welcome to</p>
        <div className="mt-1 flex items-center justify-center gap-4">
          <h1 className="font-brush aurora-text text-glow text-6xl leading-tight sm:text-7xl">友链</h1>
          <svg viewBox="0 0 40 40" className="h-8 w-8 text-nebula-300" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <circle cx="20" cy="20" r="9" fill="rgba(167,139,250,0.35)" />
            <ellipse cx="20" cy="20" rx="17" ry="6" transform="rotate(-18 20 20)" />
          </svg>
          <span className="font-script aurora-text text-5xl sm:text-6xl">Links</span>
        </div>
        <p className="mt-4 flex items-center justify-center gap-3 text-sm text-slate-300">
          <SparkleIcon className="h-3 w-3 text-ice-300" />
          与优秀的人同行，让思想走得更远
          <SparkleIcon className="h-3 w-3 text-ice-300" />
        </p>
        <div className="mx-auto mt-5 h-px w-64 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <p className="mt-4 text-xs tracking-[0.3em] text-slate-400">— 彼此点亮 · 共同成长 —</p>
      </header>

      <div className="mt-10">
        {friends.length === 0 ? (
          <div className="glass-panel rounded-2xl py-16 text-center text-sm text-slate-400">
            还没有友链，快来第一个交换吧。
          </div>
        ) : (
          <FriendsPager friends={friends} />
        )}
      </div>

      {/* 交个朋友 + Better Together */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <a
          href={mailto}
          className="aurora-btn inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium"
        >
          交个朋友
          <ArrowRightIcon className="h-4 w-4" />
        </a>
        <p className="font-script aurora-text text-2xl">Better Together</p>
      </div>
    </div>
  )
}