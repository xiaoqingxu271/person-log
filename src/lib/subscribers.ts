import { randomBytes } from 'crypto'
import { prisma } from '@/lib/db'

function createToken(): string {
  return randomBytes(24).toString('hex')
}

// ---- 反垃圾：同 IP 订阅频率限制（内存版，重启清零，单实例足够） ----
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 10
const recentByIp = new Map<string, number[]>()

export function isSubscribeRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recentByIp.set(ip, [...recent, now])
  return recent.length >= RATE_MAX
}

export interface SubscribeResult {
  subscriber: {
    id: number
    email: string
    token: string | null
    status: string
    confirmToken: string | null
  }
  /** true 表示还需点击确认邮件，才能收到新文章通知 */
  confirmationPending: boolean
}

/**
 * 幂等订阅。
 * requireConfirmation=true 时新邮箱先标记 pending 并生成确认凭证；
 * 已确认的邮箱重复提交直接成功，不重复发信。
 */
export async function subscribeEmail(
  email: string,
  opts: { requireConfirmation: boolean },
): Promise<SubscribeResult> {
  const existing = await prisma.subscriber.findUnique({ where: { email } })

  if (existing) {
    if (existing.status === 'confirmed') {
      if (existing.token) return { subscriber: existing, confirmationPending: false }
      const updated = await prisma.subscriber.update({
        where: { email },
        data: { token: createToken() },
      })
      return { subscriber: updated, confirmationPending: false }
    }
    const updated = await prisma.subscriber.update({
      where: { email },
      data: opts.requireConfirmation
        ? {
            token: existing.token ?? createToken(),
            confirmToken: createToken(),
          }
        : { token: existing.token ?? createToken(), status: 'confirmed', confirmToken: null },
    })
    return { subscriber: updated, confirmationPending: opts.requireConfirmation }
  }

  const subscriber = await prisma.subscriber.create({
    data: {
      email,
      token: createToken(),
      status: opts.requireConfirmation ? 'pending' : 'confirmed',
      confirmToken: opts.requireConfirmation ? createToken() : null,
    },
  })
  return { subscriber, confirmationPending: opts.requireConfirmation }
}

/** 用确认邮件里的凭证把订阅标记为已确认；凭证一次性使用 */
export async function confirmSubscriber(token: string) {
  const row = await prisma.subscriber.findUnique({ where: { confirmToken: token } })
  if (!row) return null
  return prisma.subscriber.update({
    where: { id: row.id },
    data: { status: 'confirmed', confirmToken: null },
  })
}

export function adminListSubscribers() {
  return prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } })
}

/** 群发与 CSV 导出只包含已确认邮箱 */
export function adminListConfirmedSubscribers() {
  return prisma.subscriber.findMany({
    where: { status: 'confirmed' },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findSubscriberByToken(token: string) {
  return prisma.subscriber.findUnique({ where: { token } })
}

/** 用退订凭证删除订阅；返回是否命中 */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const result = await prisma.subscriber.deleteMany({ where: { token } })
  return result.count > 0
}

export async function deleteSubscriber(id: number) {
  await prisma.subscriber.delete({ where: { id } })
}

/** 给邮箱打码，用于退订页展示 */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@')
  if (!domain) return '***'
  const head = name.slice(0, 1)
  return `${head}***@${domain}`
}
