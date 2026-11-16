import { prisma } from '@/lib/db'
import { recordDailyPv } from '@/lib/stats'
import { visiblePostWhere } from '@/lib/post-visibility'
import type { Prisma } from '@prisma/client'

export const POSTS_PER_PAGE = 10

const postInclude = {
  category: true,
  tags: { include: { tag: true } },
  _count: { select: { comments: { where: { status: 'approved' } } } },
} satisfies Prisma.PostInclude

export type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>

type ListResult = {
  posts: PostWithRelations[]
  total: number
  totalPages: number
}

// ---------- 前台查询（仅已发布） ----------

export async function listPublishedPosts(page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> {
  return listByWhere(visiblePostWhere(), page, perPage)
}

export async function listPostsByCategory(slug: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> {
  return listByWhere({ ...visiblePostWhere(), category: { slug } }, page, perPage)
}

export async function listPostsByTag(slug: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> {
  return listByWhere({ ...visiblePostWhere(), tags: { some: { tag: { slug } } } }, page, perPage)
}

/** 站内搜索：按空格拆词，每个词在标题/摘要/正文中匹配（AND 语义）；可按分类过滤 */
export async function searchPosts(
  query: string,
  page = 1,
  perPage = POSTS_PER_PAGE,
  categorySlug?: string,
): Promise<ListResult> {
  const words = query.trim().split(/\s+/).filter(Boolean).slice(0, 5)
  const categoryWhere: Prisma.PostWhereInput = categorySlug ? { category: { slug: categorySlug } } : {}
  if (words.length === 0) {
    return listByWhere({ ...visiblePostWhere(), ...categoryWhere }, page, perPage)
  }
  // 转义 LIKE 通配符，避免用户输入的 % 和 _ 影响匹配语义
  const like = (word: string) => word.replace(/[\\%_]/g, '\\$&')
  const where: Prisma.PostWhereInput = {
    ...visiblePostWhere(),
    ...categoryWhere,
    AND: words.map((word) => ({
      OR: [
        { title: { contains: like(word) } },
        { summary: { contains: like(word) } },
        { contentMd: { contains: like(word) } },
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
    where: visiblePostWhere(),
    orderBy: { publishedAt: 'desc' },
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      summary: true,
      coverUrl: true,
      likes: true,
      tags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  })
}

/** 相邻文章：上一篇（更早）/ 下一篇（更新） */
export async function getAdjacentPosts(postId: number, publishedAt: Date | null) {
  if (!publishedAt) return { prev: null, next: null }
  const select = { title: true, slug: true } as const
  const [prev, next] = await Promise.all([
    prisma.post.findFirst({
      where: { ...visiblePostWhere(), id: { not: postId }, publishedAt: { lt: publishedAt } },
      orderBy: { publishedAt: 'desc' },
      select,
    }),
    prisma.post.findFirst({
      where: { ...visiblePostWhere(), id: { not: postId }, publishedAt: { gt: publishedAt } },
      orderBy: { publishedAt: 'asc' },
      select,
    }),
  ])
  return { prev, next }
}

/** 分类 + 文章数 + 该分类下高频标签（取前 3） */
export async function listCategoriesWithMeta() {
  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
    include: {
      _count: { select: { posts: { where: visiblePostWhere() } } },
      posts: {
        where: visiblePostWhere(),
        select: { tags: { select: { tag: { select: { name: true, slug: true } } } } },
      },
    },
  })
  return categories.map((cat) => {
    const tally = new Map<string, { name: string; slug: string; count: number }>()
    for (const post of cat.posts) {
      for (const { tag } of post.tags) {
        const item = tally.get(tag.slug) ?? { ...tag, count: 0 }
        item.count += 1
        tally.set(tag.slug, item)
      }
    }
    const topTags = [...tally.values()].sort((a, b) => b.count - a.count).slice(0, 3)
    const { posts: _posts, ...rest } = cat
    return { ...rest, topTags }
  })
}

/** 近期文章（侧栏用） */
export async function getRecentPosts(take = 4) {
  return prisma.post.findMany({
    where: visiblePostWhere(),
    orderBy: { publishedAt: 'desc' },
    select: { title: true, slug: true, publishedAt: true, likes: true },
    take,
  })
}

/** 推荐阅读：按浏览量排序 */
export async function getRecommendedPosts(take = 4) {
  return prisma.post.findMany({
    where: visiblePostWhere(),
    orderBy: { views: 'desc' },
    select: { title: true, slug: true, publishedAt: true, coverUrl: true, views: true },
    take,
  })
}

export async function listCategoriesWithCount() {
  return prisma.category.findMany({
    orderBy: { id: 'asc' },
    include: { _count: { select: { posts: { where: visiblePostWhere() } } } },
  })
}

export async function listTagsWithCount() {
  // Tag→Post 经由显式关联表 PostTag，计数过滤需穿透到 post 上
  return prisma.tag.findMany({
    orderBy: { id: 'asc' },
    include: { _count: { select: { posts: { where: { post: visiblePostWhere() } } } } },
  })
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } })
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({ where: { slug } })
}

// ---------- 后台查询与写入 ----------

export interface AdminPostFilters {
  q?: string
  status?: 'all' | 'draft' | 'published'
}

export async function adminListPosts(filters: AdminPostFilters = {}) {
  const words = (filters.q ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 5)
  const like = (word: string) => word.replace(/[\\%_]/g, '\\$&')
  const where: Prisma.PostWhereInput = {
    ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
    ...(words.length > 0
      ? {
          AND: words.map((word) => ({
            OR: [
              { title: { contains: like(word) } },
              { slug: { contains: like(word) } },
              { summary: { contains: like(word) } },
            ],
          })),
        }
      : {}),
  }

  return prisma.post.findMany({
    where,
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

/** F-22 浏览量：详情页每次访问自增（同时记录每日 PV 用于看板趋势） */
export async function incrementPostViews(id: number) {
  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } })
  await recordDailyPv()
}

/** F-11 相关文章：按共同标签推荐（不含自身）；无共同标签时回退到最新文章 */
export async function listRelatedPosts(postId: number, tagSlugs: string[], take = 3) {
  const select = { title: true, slug: true, publishedAt: true, views: true, coverUrl: true } as const
  if (tagSlugs.length > 0) {
    const related = await prisma.post.findMany({
      where: {
        ...visiblePostWhere(),
        id: { not: postId },
        tags: { some: { tag: { slug: { in: tagSlugs } } } },
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      select,
      take,
    })
    if (related.length > 0) return related
  }
  return prisma.post.findMany({
    where: { ...visiblePostWhere(), id: { not: postId } },
    orderBy: { publishedAt: 'desc' },
    select,
    take,
  })
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
  /** 指定发布时间（未来时间即定时发布）；不传则沿用原值或当前时间 */
  publishedAt?: Date
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
      input.publishedAt ??
      (input.status === 'published' ? (existing.publishedAt ?? new Date()) : existing.publishedAt)
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
      publishedAt: input.publishedAt ?? (input.status === 'published' ? new Date() : null),
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
