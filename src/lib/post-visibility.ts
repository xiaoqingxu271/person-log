import type { Prisma } from '@prisma/client'

/** 前台可见条件：已发布且到达发布时间（未来时间视为定时发布） */
export function visiblePostWhere(now = new Date()): Prisma.PostWhereInput {
  return {
    status: 'published',
    OR: [{ publishedAt: { lte: now } }, { publishedAt: null }],
  }
}

export function isPostPublic(
  post: { status: string; publishedAt: Date | null },
  now = new Date(),
): boolean {
  return post.status === 'published' && (post.publishedAt === null || post.publishedAt <= now)
}

/** 已设为发布但发布时间在未来 */
export function isPostScheduled(
  post: { status: string; publishedAt: Date | null },
  now = new Date(),
): boolean {
  return post.status === 'published' && post.publishedAt !== null && post.publishedAt > now
}
