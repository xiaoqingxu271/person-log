type DateKey = 'publishedAt' | 'createdAt' | 'updatedAt' | 'takenAt'

const POST_DATE_KEYS: DateKey[] = ['publishedAt', 'createdAt', 'updatedAt']

/**
 * unstable_cache 会把 Date 序列化成 ISO 字符串；读缓存后还原为 Date，
 * 让上层组件/可见性判断继续拿到真实 Date 对象。
 */
export function reviveDates<T extends object>(row: T, keys: DateKey[] = POST_DATE_KEYS): T {
  const out = { ...row } as Record<string, unknown>
  for (const key of keys) {
    const value = out[key]
    if (typeof value === 'string') out[key] = new Date(value)
  }
  return out as T
}

export function reviveDateList<T extends object>(rows: T[], keys: DateKey[] = POST_DATE_KEYS): T[] {
  return rows.map((row) => reviveDates(row, keys))
}
