import { prisma } from '@/lib/db'

export interface PhotoInput {
  title: string
  imageUrl: string
  description?: string
  location?: string
  takenAt?: string
  width?: number
  height?: number
}

export type PhotoResult = { ok: true; id: number } | { ok: false; error: string }

function normalize(input: PhotoInput) {
  const title = input.title.trim().slice(0, 200)
  const imageUrl = input.imageUrl.trim().slice(0, 500)
  if (!title) return { error: '照片标题不能为空' }
  if (!imageUrl) return { error: '请上传或填写图片地址' }
  if (!/^(\/|https?:\/\/)/.test(imageUrl)) return { error: '图片地址需为站内路径或 http(s):// 链接' }
  const takenAt = input.takenAt ? new Date(input.takenAt) : null
  if (takenAt && Number.isNaN(takenAt.getTime())) return { error: '拍摄日期无效' }
  const width = Math.round(Number(input.width ?? 0))
  const height = Math.round(Number(input.height ?? 0))
  if (!Number.isInteger(width) || width < 0 || width > 20000) return { error: '图片宽度无效' }
  if (!Number.isInteger(height) || height < 0 || height > 20000) return { error: '图片高度无效' }
  return {
    data: {
      title,
      imageUrl,
      description: (input.description ?? '').trim().slice(0, 500),
      location: (input.location ?? '').trim().slice(0, 100),
      takenAt,
      width,
      height,
    },
  }
}

export async function createPhoto(input: PhotoInput): Promise<PhotoResult> {
  const parsed = normalize(input)
  if ('error' in parsed) return { ok: false, error: parsed.error ?? '参数无效' }
  const created = await prisma.photo.create({ data: parsed.data })
  return { ok: true, id: created.id }
}

export async function updatePhoto(id: number, input: PhotoInput & { isVisible?: boolean }) {
  const parsed = normalize(input)
  if ('error' in parsed) return { ok: false as const, error: parsed.error }
  await prisma.photo.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(input.isVisible === undefined ? {} : { isVisible: input.isVisible }),
    },
  })
  return { ok: true as const }
}

export async function listVisiblePhotos() {
  return prisma.photo.findMany({
    where: { isVisible: true },
    orderBy: [{ takenAt: 'desc' }, { id: 'desc' }],
  })
}

export async function adminListPhotos() {
  return prisma.photo.findMany({ orderBy: [{ takenAt: 'desc' }, { id: 'desc' }] })
}

export async function setPhotoVisible(id: number, visible: boolean) {
  await prisma.photo.update({ where: { id }, data: { isVisible: visible } })
}

export async function deletePhoto(id: number) {
  await prisma.photo.delete({ where: { id } })
}