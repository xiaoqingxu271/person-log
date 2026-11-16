import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export class TaxonomyError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export interface TaxonomyInput {
  name: string
  slug: string
  description: string
}

/** 校验分类/标签输入；slug 留空时沿用名称（与现有中文 URL 约定一致） */
export function parseTaxonomyInput(body: unknown, withDescription: boolean): TaxonomyInput {
  const data = body as Record<string, unknown> | null
  const name = typeof data?.name === 'string' ? data.name.trim().slice(0, 50) : ''
  if (!name) throw new TaxonomyError('名称不能为空')

  const rawSlug = typeof data?.slug === 'string' ? data.slug.trim() : ''
  const slug = (rawSlug || name).slice(0, 100)
  if (/[/?#]/.test(slug)) throw new TaxonomyError('slug 不能包含 / ? # 等字符')

  const description = withDescription && typeof data?.description === 'string'
    ? data.description.trim().slice(0, 500)
    : ''

  return { name, slug, description }
}

function isUniqueConflict(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002'
}

export function taxonomyErrorResponse(err: unknown) {
  if (err instanceof TaxonomyError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }
  console.error('分类/标签操作失败:', err)
  if (isUniqueConflict(err)) {
    return NextResponse.json({ error: '名称或 slug 已存在' }, { status: 409 })
  }
  return NextResponse.json({ error: '操作失败，请重试' }, { status: 500 })
}

async function assertCategoryUnique(name: string, slug: string, excludeId?: number) {
  const conflict = await prisma.category.findFirst({
    where: {
      OR: [{ name }, { slug }],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { name: true, slug: true },
  })
  if (conflict) {
    throw new TaxonomyError(conflict.name === name ? '分类名称已存在' : '分类 slug 已存在', 409)
  }
}

export async function createCategory(input: TaxonomyInput) {
  await assertCategoryUnique(input.name, input.slug)
  return prisma.category.create({ data: input })
}

export async function updateCategory(id: number, input: TaxonomyInput) {
  await assertCategoryUnique(input.name, input.slug, id)
  return prisma.category.update({ where: { id }, data: input })
}

export async function deleteCategory(id: number) {
  await prisma.category.delete({ where: { id } })
}

/** 合并分类：文章迁移到目标分类后删除来源分类 */
export async function mergeCategory(sourceId: number, targetId: number) {
  if (sourceId === targetId) throw new TaxonomyError('不能合并到自身')
  const [source, target] = await Promise.all([
    prisma.category.findUnique({ where: { id: sourceId }, select: { id: true } }),
    prisma.category.findUnique({ where: { id: targetId }, select: { id: true } }),
  ])
  if (!source || !target) throw new TaxonomyError('分类不存在', 404)

  await prisma.$transaction([
    prisma.post.updateMany({ where: { categoryId: sourceId }, data: { categoryId: targetId } }),
    prisma.category.delete({ where: { id: sourceId } }),
  ])
}

async function assertTagUnique(name: string, slug: string, excludeId?: number) {
  const conflict = await prisma.tag.findFirst({
    where: {
      OR: [{ name }, { slug }],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { name: true, slug: true },
  })
  if (conflict) {
    throw new TaxonomyError(conflict.name === name ? '标签名称已存在' : '标签 slug 已存在', 409)
  }
}

export async function createTag(input: TaxonomyInput) {
  await assertTagUnique(input.name, input.slug)
  return prisma.tag.create({ data: { name: input.name, slug: input.slug } })
}

export async function updateTag(id: number, input: TaxonomyInput) {
  await assertTagUnique(input.name, input.slug, id)
  return prisma.tag.update({ where: { id }, data: { name: input.name, slug: input.slug } })
}

export async function deleteTag(id: number) {
  await prisma.tag.delete({ where: { id } })
}

/** 合并标签：文章关联迁移到目标标签（去重）后删除来源标签 */
export async function mergeTag(sourceId: number, targetId: number) {
  if (sourceId === targetId) throw new TaxonomyError('不能合并到自身')
  const [source, target, links] = await Promise.all([
    prisma.tag.findUnique({ where: { id: sourceId }, select: { id: true } }),
    prisma.tag.findUnique({ where: { id: targetId }, select: { id: true } }),
    prisma.postTag.findMany({ where: { tagId: sourceId }, select: { postId: true } }),
  ])
  if (!source || !target) throw new TaxonomyError('标签不存在', 404)

  await prisma.$transaction([
    prisma.postTag.createMany({
      data: links.map((link) => ({ postId: link.postId, tagId: targetId })),
      skipDuplicates: true,
    }),
    prisma.tag.delete({ where: { id: sourceId } }),
  ])
}
