'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LogoMark } from '@/components/logo-mark'
import { HeaderSearch } from '@/components/header-search'
import { BellIcon, ChevronDownIcon, MenuIcon, XIcon } from '@/components/icons'

const nav = [
  { href: '/', label: '首页' },
  { href: '/archives', label: '归档' },
  { href: '/categories', label: '分类' },
  { href: '/tags', label: '标签' },
  { href: '/moments', label: '说说' },
  { href: '/music', label: '音乐' },
  { href: '/gallery', label: '相册' },
  { href: '/friends', label: '友链' },
  { href: '/about', label: '关于' },
]

interface SiteHeaderProps {
  siteName: string
  ownerName: string
  ownerAvatar: string
  hasRecentMoment: boolean
}

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

/** 悬浮玻璃导航：星系 Logo + 激活态胶囊导航 + 搜索 + 说说铃铛 + 博主头像 */
export function SiteHeader({ siteName, ownerName, ownerAvatar, hasRecentMoment }: SiteHeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-b from-night-950/70 to-transparent px-3 pb-2 pt-3 sm:px-4">
      <div className="glass-bar mx-auto flex h-16 w-full max-w-[1280px] items-center gap-3 rounded-2xl px-4 sm:px-5">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={`${siteName} 首页`}>
          <LogoMark className="h-8 w-8 transition-transform duration-700 group-hover:rotate-180" />
          <span className="font-display text-xl font-bold italic tracking-wide text-white">
            {siteName}
          </span>
        </Link>

        <nav className="ml-3 hidden items-center gap-1 lg:flex" aria-label="主导航">
          {nav.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  'relative rounded-full px-3.5 py-1.5 text-sm transition-colors ' +
                  (active
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100')
                }
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-[13px] left-1/2 h-[2px] w-7 -translate-x-1/2 rounded-full bg-gradient-to-r from-aurora-400 via-ice-400 to-nebula-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <HeaderSearch />
          <Link
            href="/moments"
            aria-label="最新说说"
            title="最新说说"
            className="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-ice-300"
          >
            <BellIcon className="h-[18px] w-[18px]" />
            {hasRecentMoment && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="animate-ping-dot absolute inline-flex h-full w-full rounded-full bg-flare-400" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-flare-400" />
              </span>
            )}
          </Link>
          <Link
            href="/about"
            className="group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/5"
            title="关于博主"
          >
            <Image
              src={ownerAvatar}
              alt={`${ownerName}的头像`}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-ice-400/40 transition-all group-hover:ring-aurora-400/60"
            />
            <span className="hidden leading-tight sm:block">
              <span className="block max-w-24 truncate text-sm font-medium text-white">{ownerName}</span>
              <span className="block text-[10px] tracking-wider text-slate-500">博主</span>
            </span>
            <ChevronDownIcon className="hidden h-3.5 w-3.5 text-slate-500 transition-colors group-hover:text-slate-300 sm:block" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
            className="rounded-full p-2 text-slate-300 transition-colors hover:bg-white/5 lg:hidden"
          >
            {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="glass-bar animate-fade-up mx-auto mt-2 w-full max-w-[1280px] rounded-2xl p-4 lg:hidden">
          <nav className="grid grid-cols-2 gap-1.5" aria-label="移动端导航">
            {nav.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={
                    'rounded-xl px-4 py-2.5 text-sm transition-colors ' +
                    (active
                      ? 'bg-white/10 font-medium text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100')
                  }
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-3 border-t border-white/10 pt-3">
            <HeaderSearch className="block" />
          </div>
        </div>
      )}
    </header>
  )
}