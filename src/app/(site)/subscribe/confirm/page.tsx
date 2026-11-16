import Link from 'next/link'
import { ConfirmSubscriptionButton } from '@/components/confirm-subscription-button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: '确认订阅',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function ConfirmSubscriptionPage({ searchParams }: Props) {
  const { token } = await searchParams
  const cleanToken = (token ?? '').trim().slice(0, 64)

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <div className="glass-panel rounded-3xl p-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-ice-400">Confirm</p>
        <h1 className="mt-3 text-2xl font-bold text-white">确认订阅博客更新</h1>

        {cleanToken ? (
          <>
            <p className="mt-4 text-sm text-slate-400">
              点击下方按钮完成确认，之后才会收到新文章邮件。
            </p>
            <div className="mt-6">
              <ConfirmSubscriptionButton token={cleanToken} />
            </div>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-slate-400">链接无效，请重新提交订阅。</p>
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
