import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'personlog_session'
const SESSION_DAYS = 7

function secretKey() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('缺少 AUTH_SECRET 环境变量（参考 .env.example）')
  return new TextEncoder().encode(secret)
}

export async function createSessionToken(username: string) {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey())
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    return (payload.username as string | undefined) ?? null
  } catch {
    return null
  }
}

/** 在服务端组件 / API 路由中读取当前登录用户名，未登录返回 null */
export async function getSessionUser() {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}
