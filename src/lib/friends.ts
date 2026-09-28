import { prisma } from '@/lib/db'

export interface CreateFriendInput {
  name: string
  url: string
  avatar?: string
  description?: string
}

export type CreateFriendResult =
  | { ok: true; id: number }
  | { ok: false; error: string }

export async function createFriend(input: CreateFriendInput): Promise<CreateFriendResult> {
  const name = input.name.trim().slice(0, 50)
  const url = input.url.trim().slice(0, 500)
  if (!name) return { ok: false, error: '站点名称不能为空' }
  if (!/^https?:\/\//.test(url)) return { ok: false, error: '网址需以 http(s):// 开头' }

  const created = await prisma.friendLink.create({
    data: {
      name,
      url,
      avatar: (input.avatar ?? '').trim().slice(0, 500),
      description: (input.description ?? '').trim().slice(0, 500),
    },
  })
  return { ok: true, id: created.id }
}

export async function listVisibleFriends() {
  return prisma.friendLink.findMany({ where: { isVisible: true }, orderBy: { id: 'asc' } })
}

export async function adminListFriends() {
  return prisma.friendLink.findMany({ orderBy: { id: 'asc' } })
}

export async function getFriendById(id: number) {
  return prisma.friendLink.findUnique({ where: { id } })
}

export async function setFriendVisible(id: number, visible: boolean) {
  await prisma.friendLink.update({ where: { id }, data: { isVisible: visible } })
}

export async function updateFriend(
  id: number,
  input: CreateFriendInput & { isVisible?: boolean },
) {
  const name = input.name.trim().slice(0, 50)
  const url = input.url.trim().slice(0, 500)
  if (!name) return { ok: false as const, error: '站点名称不能为空' }
  if (!/^https?:\/\//.test(url)) return { ok: false as const, error: '网址需以 http(s):// 开头' }
  await prisma.friendLink.update({
    where: { id },
    data: {
      name,
      url,
      avatar: (input.avatar ?? '').trim().slice(0, 500),
      description: (input.description ?? '').trim().slice(0, 500),
      ...(input.isVisible === undefined ? {} : { isVisible: input.isVisible }),
    },
  })
  return { ok: true as const }
}

export async function deleteFriend(id: number) {
  await prisma.friendLink.delete({ where: { id } })
}
