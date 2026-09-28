import { prisma } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const POSTS_PER_PAGE = 10

const publishedWhere: Prisma.PostWhereInput = { status: 'published' }

const postInclude = {
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.PostInclude

export type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>

type ListResult = {
  posts: PostWithRelations[]
  total: number
  totalPages: number
}

// ---------- 前台查询（仅已发布） ----------

export async function listPublishedPosts(page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> {
  return listByWhere(publishedWhere, page, perPage)
}

export async function listPostsByCategory(slug: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> {
  return listByWhere({ ...publishedWhere, category: { slug } }, page, perPage)
}

export async function listPostsByTag(slug: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> {
  return listByWhere({ ...publishedWhere, tags: { some: { tag: { slug } } } }, page, perPage)
}

/** 站内搜索：按空格拆词，每个词在标题/摘要/正文中匹配（AND 语义） */
export async function searchPosts(query: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> {
  const words = query.trim().split(/\s+/).filter(Boolean).slice(0, 5)
  if (words.length === 0) return { posts: [], total: 0, totalPages: 1 }
  const where: Prisma.PostWhereInput = {
    ...publishedWhere,
    AND: words.map((word) => ({
      OR: [
        { title: { contains: word } },
        { summary: { contains: word } },
        { contentMd: { contains: word } },
      ],
    })),
  }
  return listByWhere(where, page, perPage)
}

async function listByWhere(where: Prisma.PostWhereInput, page: number, perPage: number): Promise<ListResult> {
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      include: postInclude,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.post.count({ where }),
  ])
  return { posts, total, totalPages: Math.max(1, Math.ceil(total / perPage)) }
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug }, include: postInclude })
}

export async function listArchivePosts() {
  return prisma.post.findMany({
    where: publishedWhere,
    orderBy: { publishedAt: 'desc' },
    select: { title: true, slug: true, publishedAt: true },
  })
}

export async function listCategoriesWithCount() {
  return prisma.category.findMany({
    orderBy: { id: 'asc' },
    include: { _count: { select: { posts: { where: publishedWhere } } } },
  })
}

export async function listTagsWithCount() {
  // Tag→Post 经由显式关联表 PostTag，计数过滤需穿透到 post 上
  return prisma.tag.findMany({
    orderBy: { id: 'asc' },
    include: { _count: { select: { posts: { where: { post: { status: 'published' } } } } } },
  })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } })
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } })
}

// ---------- 后台查询与写入 ----------

export async function adminListPosts() {
  return prisma.post.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { category: true },
  })
}

export async function getPostForEdit(id: number) {
  return prisma.post.findUnique({ where: { id }, include: postInclude })
}

export async function deletePost(id: number) {
  await prisma.post.delete({ where: { id } })
}

/** F-22 浏览量：详情页每次访问自增 */
export async function incrementPostViews(id: number) {
  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } })
}

export interface SavePostInput {
  title: string
  slug?: string
  summary?: string
  contentMd: string
  coverUrl?: string
  status: 'draft' | 'published'
  isPinned?: boolean
  categoryName?: string
  tagNames?: string[]
}

/** 新建或更新文章；分类与标签按名称自动创建，slug 保证唯一 */
export async function savePost(input: SavePostInput, id?: number) {
  const category = input.categoryName?.trim() ? await upsertCategoryByName(input.categoryName) : null
  const tags = await upsertTagsByNames(input.tagNames ?? [])
  const slug = await ensureUniqueSlug(
    input.slug?.trim() ? slugify(input.slug) : slugify(input.title),
    id,
  )

  const data = {
    title: input.title.trim().slice(0, 200),
    slug,
    summary: (input.summary ?? '').trim().slice(0, 500),
    contentMd: input.contentMd,
    coverUrl: (input.coverUrl ?? '').trim().slice(0, 500),
    status: input.status,
    isPinned: input.isPinned ?? false,
    categoryId: category?.id ?? null,
  }

  if (id) {
    const existing = await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } })
    if (!existing) throw new Error('文章不存在')
    const publishedAt =
      input.status === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt
    return prisma.post.update({
      where: { id },
      data: {
        ...data,
        publishedAt,
        tags: { deleteMany: {}, create: tags.map((t) => ({ tagId: t.id })) },
      },
      include: postInclude,
    })
  }

  return prisma.post.create({
    data: {
      ...data,
      publishedAt: input.status === 'published' ? new Date() : null,
      tags: { create: tags.map((t) => ({ tagId: t.id })) },
    },
    include: postInclude,
  })
}

// ---------- 内部工具 ----------

/** 中文标题无法转拼音时，回退为时间戳 slug（可在编辑器手动指定英文 slug） */
export function slugify(input: string): string {
  const ascii = input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  if (ascii) return ascii.slice(0, 120)
  return `post-${Date.now().toString(36)}`
}

async function ensureUniqueSlug(base: string, excludeId?: number): Promise<string> {
  let candidate = base
  for (let i = 2; ; i++) {
    const exists = await prisma.post.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
    if (!exists) return candidate
    candidate = `${base}-${i}`
  }
}

async function upsertCategoryByName(name: string) {
  const trimmed = name.trim().slice(0, 50)
  const found = await prisma.category.findFirst({ where: { name: trimmed } })
  if (found) return found
  // 分类/标签的 slug 直接用名称本身，URL 形如 /categories/前端
  return prisma.category.create({ data: { name: trimmed, slug: trimmed } })
}

async function upsertTagsByNames(names: string[]) {
  const cleaned = [...new Set(names.map((n) => n.trim().slice(0, 50)).filter(Boolean))].slice(0, 10)
  const tags = []
  for (const name of cleaned) {
    const found = await prisma.tag.findFirst({ where: { name } })
    tags.push(found ?? (await prisma.tag.create({ data: { name, slug: name } })))
  }
  return tags
}
