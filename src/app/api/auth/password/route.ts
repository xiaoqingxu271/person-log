import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { SITE } from '@/lib/site'
import { createSessionToken, SESSION_COOKIE, getSessionUser } from '@/lib/session'

export const runtime = 'nodejs'

/** 修改密码：校验当前密码，成功后递增 sessionVersion 使其他设备会话失效 */
export async function POST(req: NextRequest) {
  const username = await getSessionUser()
  if (!username) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: '请填写当前密码和新密码' }, { status: 400 })
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: '新密码至少 8 位' }, { status: 400 })
  }
  if (Buffer.byteLength(newPassword, 'utf8') > 72) {
    return NextResponse.json({ error: '新密码过长（最多 72 字节）' }, { status: 400 })
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: '新密码不能与当前密码相同' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: '当前密码不正确' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, sessionVersion: { increment: 1 } },
    select: { username: true, sessionVersion: true },
  })

  const token = await createSessionToken(updated.username, updated.sessionVersion)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600,
    secure: SITE.url.startsWith('https://'),
  })
  return res
}
