import { cache } from 'react'
import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/db'
import { reviveDateList } from '@/lib/cache-dates'

const MOMENTS_TAG = 'moments'

export interface CreateMomentInput {
  content: string
  imageUrl?: string
}

export type CreateMomentResult =
  | { ok: true; id: number }
  | { ok: false; error: string }

/** 发布说说（仅博主） */
export async function createMoment(input: CreateMomentInput): Promise<CreateMomentResult> {
  const content = input.content.trim()
  if (!content || content.length > 1000) {
    return { ok: false, error: '说说内容需在 1~1000 字之间' }
  }
  const created = await prisma.moment.create({
    data: {
      content,
      imageUrl: (input.imageUrl ?? '').trim().slice(0, 500),
    },
  })
  revalidateTag(MOMENTS_TAG, 'max')
  return { ok: true, id: created.id }
}

const cachedMoments = unstable_cache(
  async (take = 100) => prisma.moment.findMany({ orderBy: { createdAt: 'desc' }, take }),
  ['moments-list'],
  { tags: [MOMENTS_TAG], revalidate: 60 },
)

export const listMoments = cache(async (take = 100) =>
  reviveDateList(await cachedMoments(take), ['createdAt']),
)

/** 近 7 天是否有新说说（导航铃铛红点，每个前台页面都会读） */
export const hasRecentMoment = cache(
  unstable_cache(
    async (): Promise<boolean> => {
      const since = new Date(Date.now() - 7 * 86400000)
      const found = await prisma.moment
        .findFirst({ where: { createdAt: { gte: since } }, select: { id: true } })
        .catch(() => null)
      return Boolean(found)
    },
    ['recent-moment'],
    { tags: [MOMENTS_TAG], revalidate: 60 },
  ),
)

export async function adminListMoments(take = 100) {
  return prisma.moment.findMany({ orderBy: { createdAt: 'desc' }, take })
}

export async function deleteMoment(id: number) {
  await prisma.moment.delete({ where: { id } })
  revalidateTag(MOMENTS_TAG, 'max')
}
