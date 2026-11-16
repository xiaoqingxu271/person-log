import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { getSiteConfig } from '@/lib/site-config'
import { isMailConfigured, mailOwnerAddress, sendMail } from '@/lib/mail'
import { smtpTestEmail } from '@/lib/email-templates'

export const runtime = 'nodejs'

/** 后台验证 SMTP：向博主邮箱发一封测试邮件 */
export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  if (!isMailConfigured()) {
    return NextResponse.json(
      { error: '未配置 SMTP，请先在 .env 中设置 SMTP_HOST / MAIL_FROM' },
      { status: 503 },
    )
  }
  const to = mailOwnerAddress()
  if (!to) {
    return NextResponse.json({ error: '缺少 MAIL_FROM 或 SMTP_USER' }, { status: 503 })
  }

  const cfg = await getSiteConfig()
  const result = await sendMail({ to, ...smtpTestEmail({ siteName: cfg.siteName }) })
  if (!result.ok) {
    const reason = 'error' in result ? result.error : '未配置 SMTP'
    return NextResponse.json({ error: `发送失败：${reason}` }, { status: 502 })
  }
  return NextResponse.json({ ok: true, to })
}
