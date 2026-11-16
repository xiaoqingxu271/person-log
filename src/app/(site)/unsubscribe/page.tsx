import Link from 'next/link'
import { findSubscriberByToken, maskEmail } from '@/lib/subscribers'
import { UnsubscribeButton } from '@/components/unsubscribe-button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '退订订阅',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams
  const cleanToken = (token ?? '').trim().slice(0, 64)
  const subscriber = cleanToken ? await findSubscriberByToken(cleanToken) : null

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <div className="glass-panel rounded-3xl p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-ice-400">Unsubscribe</p>
        <h1 className="mt-3 text-2xl font-bold text-white">退订博客更新通知</h1>

        {subscriber ? (
          <>
            <p className="mt-4 text-sm text-slate-400">
              当前邮箱：<span className="text-slate-200">{maskEmail(subscriber.email)}</span>
            </p>
            <div className="mt-6">
              <UnsubscribeButton token={cleanToken} />
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-400">链接无效，或该邮箱已经退订。</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-white px-5 py-2 text-sm font-medium text-night-950 transition-colors hover:bg-slate-200"
            >
              返回首页
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
