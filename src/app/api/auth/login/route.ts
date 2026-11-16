import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { SITE } from '@/lib/site'
import { createSessionToken, SESSION_COOKIE } from '@/lib/session'
import { clearLoginFailures, loginLockRemainingMs, recordLoginFailure } from '@/lib/login-rate-limit'

// 仅用于用户不存在时也执行一次 bcrypt 比较，避免通过响应时间枚举用户名
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

/** 取真实客户端 IP：优先 Nginx 写入的 X-Real-IP，否则用 X-Forwarded-For 最后一段 */
function clientIp(req: NextRequest): string {
  const real = req.headers.get('x-real-ip')?.trim()
  if (real) return real
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }
  return 'unknown'
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  if (!username || !password) {
    return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 })
  }

  const ip = clientIp(req)
  const keys = [`ip:${ip}`, `combo:${ip}|${username.toLowerCase()}`]
  const lockedMs = Math.max(...keys.map((key) => loginLockRemainingMs(key)))
  if (lockedMs > 0) {
    const minutes = Math.ceil(lockedMs / 60000)
    return NextResponse.json(
      { error: `登录失败次数过多，请 ${minutes} 分钟后再试` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(lockedMs / 1000)) } },
    )
  }

  const user = await prisma.user.findUnique({ where: { username } })
  const valid = user
    ? await bcrypt.compare(password, user.passwordHash)
    : await bcrypt.compare(password, DUMMY_HASH)

  if (!user || !valid) {
    const remaining = Math.max(...keys.map((key) => recordLoginFailure(key)))
    if (remaining > 0) {
      return NextResponse.json(
        { error: `登录失败次数过多，请 ${Math.ceil(remaining / 60000)} 分钟后再试` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(remaining / 1000)) } },
      )
    }
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }

  keys.forEach(clearLoginFailures)
  const token = await createSessionToken(user.username, user.sessionVersion)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 3600,
    // 正式域名配置为 https 后自动启用 Secure
    secure: SITE.url.startsWith('https://'),
  })
  return res
}
