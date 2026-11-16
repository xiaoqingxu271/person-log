import { cache } from 'react'
import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/db'
import { reviveDateList, reviveDates } from '@/lib/cache-dates'
import { recordDailyPv } from '@/lib/stats'
import { visiblePostWhere } from '@/lib/post-visibility'
import type { Prisma } from '@prisma/client'

export const POSTS_PER_PAGE = 10

/** 前台内容统一失效标签：后台写入后调用 revalidateTag(PostsTag) */
const PostsTag = 'posts'

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

const cachedPublishedPosts = unstable_cache(
  async (page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> =>
    listByWhere(visiblePostWhere(), page, perPage),
  ['published-posts'],
  { tags: [PostsTag], revalidate: 60 },
)

export const listPublishedPosts = cache(
  async (page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> => {
    const result = await cachedPublishedPosts(page, perPage)
    return { ...result, posts: reviveDateList(result.posts) }
  },
)

const cachedPostsByCategory = unstable_cache(
  async (slug: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> =>
    listByWhere({ ...visiblePostWhere(), category: { slug } }, page, perPage),
  ['posts-by-category'],
  { tags: [PostsTag], revalidate: 60 },
)

export const listPostsByCategory = cache(
  async (slug: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> => {
    const result = await cachedPostsByCategory(slug, page, perPage)
    return { ...result, posts: reviveDateList(result.posts) }
  },
)

const cachedPostsByTag = unstable_cache(
  async (slug: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> =>
    listByWhere({ ...visiblePostWhere(), tags: { some: { tag: { slug } } } }, page, perPage),
  ['posts-by-tag'],
  { tags: [PostsTag], revalidate: 60 },
)

export const listPostsByTag = cache(
  async (slug: string, page = 1, perPage = POSTS_PER_PAGE): Promise<ListResult> => {
    const result = await cachedPostsByTag(slug, page, perPage)
    return { ...result, posts: reviveDateList(result.posts) }
  },
)

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

const cachedPostBySlug = unstable_cache(
  async (slug: string) => prisma.post.findUnique({ where: { slug }, include: postInclude }),
  ['post-by-slug'],
  { tags: [PostsTag], revalidate: 60 },
)

export const getPostBySlug = cache(async (slug: string) => {
  const post = await cachedPostBySlug(slug)
  return post ? reviveDates(post) : null
})

const cachedArchivePosts = unstable_cache(
  async () =>
    prisma.post.findMany({
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
    }),
  ['archive-posts'],
  { tags: [PostsTag], revalidate: 60 },
)

export const listArchivePosts = cache(async () =>
  reviveDateList(await cachedArchivePosts(), ['publishedAt']),
)

/** 相邻文章：上一篇（更早）/ 下一篇（更新） */
export const getAdjacentPosts = cache(
  unstable_cache(
    async (postId: number, publishedAtISO: string | null) => {
      if (!publishedAtISO) return { prev: null, next: null }
      const publishedAt = new Date(publishedAtISO)
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
    },
    ['adjacent-posts'],
    { tags: [PostsTag], revalidate: 60 },
  ),
)

/** 分类 + 文章数 + 该分类下高频标签（取前 3） */
export const listCategoriesWithMeta = cache(
  unstable_cache(
    async () => {
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
    },
    ['categories-with-meta'],
    { tags: [PostsTag], revalidate: 60 },
  ),
)

/** 近期文章（侧栏用） */
const cachedRecentPosts = unstable_cache(
  async (take = 4) =>
    prisma.post.findMany({
      where: visiblePostWhere(),
      orderBy: { publishedAt: 'desc' },
      select: { title: true, slug: true, publishedAt: true, likes: true },
      take,
    }),
  ['recent-posts'],
  { tags: [PostsTag], revalidate: 60 },
)

export const getRecentPosts = cache(async (take = 4) =>
  reviveDateList(await cachedRecentPosts(take), ['publishedAt']),
)

/** 推荐阅读：按浏览量排序 */
const cachedRecommendedPosts = unstable_cache(
  async (take = 4) =>
    prisma.post.findMany({
      where: visiblePostWhere(),
      orderBy: { views: 'desc' },
      select: { title: true, slug: true, publishedAt: true, coverUrl: true, views: true },
      take,
    }),
  ['recommended-posts'],
  { tags: [PostsTag], revalidate: 60 },
)

export const getRecommendedPosts = cache(async (take = 4) =>
  reviveDateList(await cachedRecommendedPosts(take), ['publishedAt']),
)

export const listCategoriesWithCount = cache(
  unstable_cache(
    async () =>
      prisma.category.findMany({
        orderBy: { id: 'asc' },
        include: { _count: { select: { posts: { where: visiblePostWhere() } } } },
      }),
    ['categories-with-count'],
    { tags: [PostsTag], revalidate: 60 },
  ),
)

export const listTagsWithCount = cache(
  unstable_cache(
    // Tag→Post 经由显式关联表 PostTag，计数过滤需穿透到 post 上
    async () =>
      prisma.tag.findMany({
        orderBy: { id: 'asc' },
        include: { _count: { select: { posts: { where: { post: visiblePostWhere() } } } } },
      }),
    ['tags-with-count'],
    { tags: [PostsTag], revalidate: 60 },
  ),
)

export const getCategoryBySlug = cache(
  unstable_cache(
    async (slug: string) => prisma.category.findUnique({ where: { slug } }),
    ['category-by-slug'],
    { tags: [PostsTag], revalidate: 60 },
  ),
)

export const getTagBySlug = cache(
  unstable_cache(
    async (slug: string) => prisma.tag.findUnique({ where: { slug } }),
    ['tag-by-slug'],
    { tags: [PostsTag], revalidate: 60 },
  ),
)

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
  revalidateTag(PostsTag, 'max')
}

/** F-22 浏览量：详情页每次访问自增（同时记录每日 PV 用于看板趋势） */
export async function incrementPostViews(id: number) {
  await prisma.post.update({ where: { id }, data: { views: { increment: 1 } } })
  await recordDailyPv()
}

/** F-11 相关文章：按共同标签推荐（不含自身）；无共同标签时回退到最新文章 */
const cachedRelatedPosts = unstable_cache(
  async (postId: number, tagSlugs: string[], take = 3) => {
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
  },
  ['related-posts'],
  { tags: [PostsTag], revalidate: 60 },
)

export const listRelatedPosts = cache(async (postId: number, tagSlugs: string[], take = 3) =>
  reviveDateList(await cachedRelatedPosts(postId, tagSlugs, take), ['publishedAt']),
)

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
    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        publishedAt,
        tags: { deleteMany: {}, create: tags.map((t) => ({ tagId: t.id })) },
      },
      include: postInclude,
    })
    revalidateTag(PostsTag, 'max')
    return updated
  }

  const created = await prisma.post.create({
    data: {
      ...data,
      publishedAt: input.publishedAt ?? (input.status === 'published' ? new Date() : null),
      tags: { create: tags.map((t) => ({ tagId: t.id })) },
    },
    include: postInclude,
  })
  revalidateTag(PostsTag, 'max')
  return created
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
