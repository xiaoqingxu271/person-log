import Link from 'next/link'
import { AuroraBackground } from '@/components/aurora-background'
import { HomeIcon } from '@/components/icons'

export default function RootNotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      <AuroraBackground />
      <div className="glass-panel relative z-10 w-full max-w-md rounded-3xl px-8 py-12 text-center">
        <p className="font-script aurora-text text-2xl">Lost in the aurora</p>
        <h1 className="text-glow mt-2 text-5xl font-bold text-white">404</h1>
        <p className="mt-3 text-sm text-slate-400">页面不存在或已被移动。</p>
        <Link
          href="/"
          className="aurora-btn mt-7 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium"
        >
          <HomeIcon className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    </div>
  )
}