import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '隐私政策',
  description: '本站收集哪些信息、如何使用与保护，以及你可以如何管理自己的数据。',
}

const SECTIONS = [
  {
    title: '1. 我们收集哪些信息',
    items: [
      '评论：你主动填写的昵称、邮箱、个人网址（可选），以及评论内容、提交时间。为防范垃圾评论与滥用，服务端还会记录提交时的 IP 地址与浏览器 User-Agent。',
      '邮箱订阅：你主动提交的邮箱地址，用于接收站点内容更新。',
      '访问统计：文章浏览量、每日页面访问量等聚合数据，用于了解内容受欢迎程度，不用于识别个人身份。',
    ],
  },
  {
    title: '2. 信息如何使用',
    items: [
      '展示评论、回复通知与头像（邮箱哈希会用于请求 Cravatar 头像服务，邮箱本身不会公开展示）。',
      '审核、过滤垃圾评论，处理滥用与安全事件。',
      '统计内容阅读情况，改进站点与写作方向。',
      '向你发送你主动订阅的内容更新。',
    ],
  },
  {
    title: '3. Cookie 与本地存储',
    items: [
      '游客浏览本站不需要登录，也不会设置账号 Cookie。',
      '仅站长登录后台时会设置一个会话 Cookie（personlog_session），用于维持登录状态，有效期 7 天，改密后旧会话立即失效。',
      '文章点赞等轻量交互会在你的浏览器本地存储中记录状态，不会上传可识别身份的信息。',
    ],
  },
  {
    title: '4. 第三方服务',
    items: [
      '评论头像由 Cravatar（cravatar.cn）提供，浏览器会携带邮箱哈希向其请求头像图片。',
      '站点可能包含指向 GitHub、音乐平台等外部链接；访问这些链接后，其隐私政策由对应平台负责。',
    ],
  },
  {
    title: '5. 存储、保留与安全',
    items: [
      '评论与订阅信息存储在站点自有的数据库中，仅在提供服务所必需的范围内保留。',
      '我们采取密码哈希、后台登录限流、评论先审后显、HTTPS 传输等措施保护数据。',
      '除法律法规要求或服务安全所必需外，我们不会出售、出租或向无关第三方披露你的信息。',
    ],
  },
  {
    title: '6. 你的权利',
    items: [
      '你可以随时要求查询、更正或删除你提交的评论与订阅邮箱。',
      '订阅邮件会附带退订链接；你也可以通过站长提供的退订链接自助退订，退订后邮箱记录会被删除。',
      '如需删除数据或有其他疑问，请通过页脚邮箱联系站长，我们会在核实后尽快处理。',
    ],
  },
]

export default async function PrivacyPage() {
  const cfg = await getSiteConfig()

  return (
    <div className="mx-auto w-full max-w-[900px] px-3 py-8 sm:px-4">
      <article className="glass-panel animate-fade-up rounded-3xl p-6 sm:p-10">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-ice-400">Privacy</p>
        <h1 className="font-serif-cn text-glow mt-2 text-3xl font-bold text-white sm:text-4xl">
          隐私政策
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          本政策说明 {cfg.siteName} 会收集哪些信息、为何收集、如何保护，以及你可以如何管理自己的数据。
          最后更新：2026-11-16。
        </p>

        <div className="mt-8 space-y-8">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-slate-100">{section.title}</h2>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-slate-300">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ice-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-300">
          <h2 className="font-bold text-slate-100">7. 联系我们</h2>
          <p className="mt-2">
            如对本政策或数据处理有疑问，可发送邮件至{' '}
            {cfg.email ? (
              <a href={`mailto:${cfg.email}`} className="text-ice-300 hover:underline">
                {cfg.email}
              </a>
            ) : (
              <span>页脚展示的联系邮箱</span>
            )}
            。政策如有重大变更，会在本页更新并标注日期。
          </p>
        </div>

        <p className="mt-8 text-sm text-slate-400">
          <Link href="/" className="text-ice-300 hover:underline">
            返回首页
          </Link>
        </p>
      </article>
    </div>
  )
}
