import { prisma } from '@/lib/db'

export interface MusicInput {
  title: string
  artist: string
  coverUrl?: string
  audioUrl?: string
  genre?: string
  rating?: number
  review?: string
  listenUrl?: string
}

export type MusicResult = { ok: true; id: number } | { ok: false; error: string }

function normalize(input: MusicInput) {
  const title = input.title.trim().slice(0, 200)
  const artist = input.artist.trim().slice(0, 200)
  if (!title) return { error: '专辑名称不能为空' }
  if (!artist) return { error: '艺术家不能为空' }
  const rating = Math.round(Number(input.rating ?? 0))
  if (!Number.isInteger(rating) || rating < 0 || rating > 5) return { error: '评分需为 0~5' }
  const listenUrl = (input.listenUrl ?? '').trim().slice(0, 500)
  if (listenUrl && !/^https?:\/\//.test(listenUrl)) return { error: '收听链接需以 http(s):// 开头' }
  const audioUrl = (input.audioUrl ?? '').trim().slice(0, 500)
  if (audioUrl && !/^(\/|https?:\/\/)/.test(audioUrl)) return { error: '音频地址需为站内路径或 http(s):// 链接' }
  return {
    data: {
      title,
      artist,
      coverUrl: (input.coverUrl ?? '').trim().slice(0, 500),
      audioUrl,
      genre: (input.genre ?? '').trim().slice(0, 50),
      rating,
      review: (input.review ?? '').trim().slice(0, 1000),
      listenUrl,
    },
  }
}

export async function createMusic(input: MusicInput): Promise<MusicResult> {
  const parsed = normalize(input)
  if ('error' in parsed) return { ok: false, error: parsed.error ?? '参数无效' }
  const created = await prisma.musicItem.create({ data: parsed.data })
  return { ok: true, id: created.id }
}

export async function updateMusic(id: number, input: MusicInput & { isVisible?: boolean }) {
  const parsed = normalize(input)
  if ('error' in parsed) return { ok: false as const, error: parsed.error }
  await prisma.musicItem.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(input.isVisible === undefined ? {} : { isVisible: input.isVisible }),
    },
  })
  return { ok: true as const }
}

export async function listVisibleMusic() {
  return prisma.musicItem.findMany({
    where: { isVisible: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })
}

export async function adminListMusic() {
  return prisma.musicItem.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] })
}

export async function setMusicVisible(id: number, visible: boolean) {
  await prisma.musicItem.update({ where: { id }, data: { isVisible: visible } })
}

export async function deleteMusic(id: number) {
  await prisma.musicItem.delete({ where: { id } })
}