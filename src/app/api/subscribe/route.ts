import { NextRequest, NextResponse } from 'next/server'
import { isSubscribeRateLimited, subscribeEmail } from '@/lib/subscribers'
import { isMailConfigured } from '@/lib/mail'
import { sendSubscriptionConfirmation } from '@/lib/notifications'

export const runtime = 'nodejs'

/** 邮箱订阅：格式校验 + 频率限制 + 幂等入库；配置了 SMTP 时先发确认邮件 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isSubscribeRateLimited(ip)) {
    return NextResponse.json({ error: '提交太频繁了，请 10 分钟后再试' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
  }

  // 未配置 SMTP 时无法发确认信，直接确认，保持旧行为
  const requireConfirmation = isMailConfigured()

  try {
    const { subscriber, confirmationPending } = await subscribeEmail(email, {
      requireConfirmation,
    })

    if (confirmationPending && subscriber.confirmToken) {
      const sent = await sendSubscriptionConfirmation(email, subscriber.confirmToken)
      if (!sent) {
        return NextResponse.json({ error: '确认邮件发送失败，请稍后再试' }, { status: 502 })
      }
    }

    return NextResponse.json({ ok: true, confirmationRequired: confirmationPending })
  } catch {
    return NextResponse.json({ error: '订阅失败，请稍后再试' }, { status: 500 })
  }
}
