import Image from 'next/image'
import { AuthorActions } from '@/components/author-actions'
import { SparkleIcon } from '@/components/icons'
import { formatCount } from '@/lib/format'

interface AuthorCardProps {
  name: string
  avatar: string
  tagline: string
  email: string
  stats: { posts: number; likes: number; tags: number }
}

/** 文章侧栏作者卡：光环头像 + 认证徽标 + 三项统计 + 关注/私信 */
export function AuthorCard({ name, avatar, tagline, email, stats }: AuthorCardProps) {
  return (
    <section className="glass-panel rounded-2xl p-6 text-center">
      <div className="relative mx-auto h-24 w-24">
        <span aria-hidden className="absolute inset-0 rounded-full bg-gradient-to-br from-aurora-400 via-ice-400 to-flare-400 opacity-80 blur-[6px]" />
        <Image
          src={avatar}
          alt={`${name}的头像`}
          width={96}
          height={96}
          className="relative h-24 w-24 rounded-full border-2 border-night-900 object-cover"
        />
        <SparkleIcon className="absolute -left-3 top-2 h-3 w-3 text-ice-200" />
        <SparkleIcon className="absolute -right-2 top-8 h-2.5 w-2.5 text-flare-300" />
        <SparkleIcon className="absolute -bottom-1 left-4 h-2 w-2 text-nebula-300" />
      </div>
      <h2 className="mt-4 flex items-center justify-center gap-1.5 text-lg font-bold text-white">
        {name}
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ice-400" fill="currentColor" aria-label="认证博主">
          <path d="M12 1.8 14.5 4l3.2-.4 1 3.1 2.9 1.5-1 3.1 1 3.1-2.9 1.5-1 3.1-3.2-.4L12 22.2 9.5 20l-3.2.4-1-3.1-2.9-1.5 1-3.1-1-3.1 2.9-1.5 1-3.1 3.2.4Z" />
          <path d="m10.6 14.6-2.3-2.3 1.1-1.1 1.2 1.2 3.6-3.6 1.1 1.1Z" fill="#0a0f24" />
        </svg>
      </h2>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{tagline}</p>
      <div className="mt-5 grid grid-cols-3 divide-x divide-white/10">
        {[
          { value: stats.posts, label: '文章' },
          { value: stats.likes, label: '获赞' },
          { value: stats.tags, label: '标签' },
        ].map((item) => (
          <div key={item.label} className="px-1">
            <p className="text-lg font-bold text-white">{formatCount(item.value)}</p>
            <p className="mt-0.5 text-xs text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
      <AuthorActions email={email} />
    </section>
  )
}