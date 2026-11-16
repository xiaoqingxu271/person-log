import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'

export const SESSION_COOKIE = 'personlog_session'
const SESSION_DAYS = 7

function secretKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('缺少 AUTH_SECRET 环境变量（参考 .env.example）')
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(username: string, sessionVersion: number) {
  return new SignJWT({ username, sv: sessionVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey())
}

export interface SessionPayload {
  username: string
  sessionVersion: number
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    if (typeof payload.username !== 'string' || typeof payload.sv !== 'number') return null
    return { username: payload.username, sessionVersion: payload.sv }
  } catch {
    return null
  }
}

/** 在服务端组件 / API 路由中读取当前登录用户名，未登录或会话已失效返回 null */
export async function getSessionUser() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const payload = await verifySessionToken(token)
  if (!payload) return null

  // 改密会递增 sessionVersion，使其他设备上的旧会话立即失效
  const user = await prisma.user
    .findUnique({
      where: { username: payload.username },
      select: { sessionVersion: true },
    })
    .catch(() => null)
  if (!user || user.sessionVersion !== payload.sessionVersion) return null
  return payload.username
}
