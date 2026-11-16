import { readFile } from 'fs/promises'
import path from 'path'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/site-config'
import { getBlogStats } from '@/lib/stats'
import { MarkdownView } from '@/lib/markdown'
import { ArrowRightIcon, GithubIcon, MailIcon, SparkleIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '关于' }

const STACK = [
  { name: 'Next.js', color: '#7dd3fc' },
  { name: 'React', color: '#6ee7b7' },
  { name: 'TypeScript', color: '#38bdf8' },
  { name: 'Prisma + MySQL', color: '#a78bfa' },
  { name: 'Tailwind CSS', color: '#e879f9' },
]

const DOING = [
  { name: 'Person Log', desc: '持续迭代的个人博客系统' },
  { name: '极光相册', desc: '摄影作品的整理与分享', href: '/gallery' },
  { name: '音乐库', desc: '循环过的旋律与私藏专辑', href: '/music' },
  { name: 'LangGraph 实践', desc: '探索 LLM 应用的更多可能性' },
  { name: 'Side Projects', desc: '一些有趣的小实验' },
]

async function loadAbout() {
  try {
    return await readFile(path.join(process.cwd(), 'content', 'about.md'), 'utf8')
  } catch {
    return '关于页内容待补充：编辑项目根目录的 `content/about.md`，本页会随之更新。'
  }
}

function CardTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-base font-bold text-white">
        {icon}
        {title}
      </h2>
      <span aria-hidden className="font-mono text-xs tracking-tighter text-slate-600">
        {'///'}
      </span>
    </div>
  )
}

export default async function AboutPage() {
  const [content, cfg, stats, owner] = await Promise.all([
    loadAbout(),
    getSiteConfig(),
    getBlogStats(),
    prisma.user.findFirst({ select: { displayName: true, avatarUrl: true } }).catch(() => null),
  ])
  const ownerName = owner?.displayName || cfg.siteName
  const ownerAvatar = owner?.avatarUrl || '/images/avatar.jpg'
  const github = cfg.githubUrl || 'https://github.com'

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 py-8 sm:px-4">
      {/* 顶排四卡 */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[1.15fr_0.9fr_0.9fr_0.9fr]">
        <section className="glass-panel animate-fade-up rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <span className="relative block h-16 w-16 shrink-0">
              <span aria-hidden className="absolute inset-0 rounded-full bg-gradient-to-br from-aurora-400 via-ice-400 to-flare-400 opacity-80 blur-[5px]" />
              <Image
                src={ownerAvatar}
                alt={`${ownerName}的头像`}
                width={64}
                height={64}
                className="relative h-16 w-16 rounded-full border-2 border-night-900 object-cover"
              />
            </span>
            <div className="min-w-0">
              <h1 className="font-serif-cn truncate text-xl font-bold text-white">{ownerName}</h1>
              <p className="mt-1 text-xs text-slate-400">在代码与文字之间，寻找更广阔的世界。</p>
            </div>
          </div>
          <p className="mt-4 border-t border-white/10 pt-4 text-sm leading-relaxed text-slate-300">
            你好，我是 {ownerName}，一名热爱技术与写作的开发者。喜欢探索新技术，也喜欢用文字记录思考与生活。
            这里是我的个人博客，分享编程、产品、思考与旅行的点滴。希望能在这里与你一起遇见更大的世界。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              className="aurora-btn inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={cfg.email ? `mailto:${cfg.email}` : '/friends'}
              className="glass-chip inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm text-slate-200 transition-colors hover:border-ice-400/40 hover:text-ice-300"
            >
              <MailIcon className="h-4 w-4" />
              发邮件
            </a>
          </div>
        </section>

        <section className="glass-panel animate-fade-up rounded-2xl p-6" style={{ animationDelay: '70ms' }}>
          <CardTitle
            title="技术栈"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-aurora-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
              </svg>
            }
          />
          <ul className="mt-4 space-y-3">
            {STACK.map((item) => (
              <li key={item.name} className="flex items-center gap-2.5 text-sm text-slate-200">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: item.color }} />
                {item.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel animate-fade-up rounded-2xl p-6" style={{ animationDelay: '140ms' }}>
          <CardTitle
            title="正在做"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-flare-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8-.7-.7-2-.7-3-.2ZM12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.9 7.4-6 11a22 22 0 0 1-4 2Z" />
                <path d="M9 12H4s.5-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.5 4-2c1.1-1.6 0-5 0-5" />
              </svg>
            }
          />
          <ul className="mt-4 space-y-3.5">
            {DOING.map((item) => (
              <li key={item.name}>
                {'href' in item && item.href ? (
                  <Link href={item.href} className="group flex items-center gap-2 text-sm font-medium text-slate-100 transition-colors hover:text-aurora-300">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-aurora-400" />
                    {item.name}
                    <ArrowRightIcon className="h-3 w-3 text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-aurora-300" />
                  </Link>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-100">
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-aurora-400" />
                    {item.name}
                  </p>
                )}
                <p className="mt-0.5 pl-3.5 text-xs text-slate-500">{item.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-panel animate-fade-up rounded-2xl p-6" style={{ animationDelay: '210ms' }}>
          <CardTitle
            title="统计"
            icon={
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-ice-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
              </svg>
            }
          />
          <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 text-center">
            {[
              { value: stats.posts, label: '文章' },
              { value: stats.likes, label: '赞' },
              { value: stats.tags, label: '标签' },
            ].map((item) => (
              <div key={item.label} className="px-1">
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="relative mt-4 h-24 overflow-hidden rounded-xl border border-white/10">
            <Image src="/images/aurora-lake.jpg" alt="极光湖景" fill sizes="280px" className="object-cover" />
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">持续记录，保持热爱</p>
        </section>
      </div>

      {/* 宽卡：水晶鸟 + 关于我 */}
      <section className="glass-panel animate-fade-up mt-6 grid overflow-hidden rounded-3xl md:grid-cols-[0.9fr_1.1fr]" style={{ animationDelay: '260ms' }}>
        <div className="relative min-h-64 md:min-h-full">
          <Image
            src="/images/crystal-bird.jpg"
            alt="水晶飞鸟插画"
            fill
            sizes="(max-width: 768px) 100vw, 560px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-night-900/40" />
          <div className="absolute bottom-5 left-6">
            <p className="font-script text-glow text-2xl leading-tight text-ice-100">
              Explore
              <br />
              a Bigger World
            </p>
            <p className="font-script mt-1 text-sm text-slate-300">{ownerName}</p>
          </div>
        </div>
        <div className="p-6 sm:p-9">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-ice-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
            </svg>
            关于我
          </h2>
          <div className="mt-4">
            <MarkdownView content={content} />
          </div>
          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="flex gap-3 text-sm leading-relaxed text-slate-200">
              <span aria-hidden className="font-serif-cn text-2xl leading-none text-nebula-400">“</span>
              保持好奇，持续学习，在广阔的世界里，做一个温柔而坚定的人。
            </p>
            <p className="mt-3 text-right text-sm text-slate-400">— {ownerName}</p>
          </div>
        </div>
      </section>

      <p className="mt-8 flex items-center justify-center gap-3 text-center text-xs tracking-wider text-slate-500">
        用代码构建，用文字记录
        <SparkleIcon className="h-3 w-3 text-nebula-400" />
        在更大的世界里，做更好的自己
      </p>
    </div>
  )
}