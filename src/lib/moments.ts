import { prisma } from '@/lib/db'

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
  return { ok: true, id: created.id }
}

export async function listMoments(take = 100) {
  return prisma.moment.findMany({ orderBy: { createdAt: 'desc' }, take })
}

export async function adminListMoments(take = 100) {
  return prisma.moment.findMany({ orderBy: { createdAt: 'desc' }, take })
}

export async function deleteMoment(id: number) {
  await prisma.moment.delete({ where: { id } })
}
