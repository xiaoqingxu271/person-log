// 登录失败计数（进程内存版，单实例部署足够；重启后清零）
const WINDOW_MS = 15 * 60 * 1000
const LOCK_MS = 15 * 60 * 1000
const MAX_FAILURES = 5
const MAX_KEYS = 5000

interface AttemptEntry {
  failures: number
  firstFailureAt: number
  lockedUntil: number
}

const attempts = new Map<string, AttemptEntry>()

function prune(now: number) {
  if (attempts.size <= MAX_KEYS) return
  for (const [key, entry] of attempts) {
    const expired = entry.lockedUntil <= now && now - entry.firstFailureAt > WINDOW_MS
    if (expired) attempts.delete(key)
  }
}

/** 剩余锁定毫秒数；0 表示可继续尝试 */
export function loginLockRemainingMs(key: string, now = Date.now()): number {
  const entry = attempts.get(key)
  if (!entry) return 0
  if (entry.lockedUntil > now) return entry.lockedUntil - now
  if (now - entry.firstFailureAt > WINDOW_MS) {
    attempts.delete(key)
    return 0
  }
  return 0
}

/** 记录一次失败；达到阈值时返回锁定剩余时间 */
export function recordLoginFailure(key: string, now = Date.now()): number {
  prune(now)
  const entry = attempts.get(key)
  if (!entry || now - entry.firstFailureAt > WINDOW_MS) {
    attempts.set(key, { failures: 1, firstFailureAt: now, lockedUntil: 0 })
    return 0
  }
  entry.failures += 1
  if (entry.failures >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCK_MS
    return LOCK_MS
  }
  return 0
}

export function clearLoginFailures(key: string) {
  attempts.delete(key)
}
