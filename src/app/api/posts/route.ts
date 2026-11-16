import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { savePost } from '@/lib/posts'

/** 用顿号/逗号/空白把标签输入拆成数组 */
function parseTags(input: unknown): string[] {
  if (typeof input !== 'string') return []
  return input.split(/[，,、\s]+/).filter(Boolean)
}

/** 返回 undefined 表示未指定，null 表示格式非法 */
function parsePublishedAt(input: unknown): Date | null | undefined {
  if (input === undefined || input === null || input === '') return undefined
  if (typeof input !== 'string') return null
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (
    !body ||
    typeof body.title !== 'string' ||
    !body.title.trim() ||
    typeof body.contentMd !== 'string'
  ) {
    return NextResponse.json({ error: '标题和正文不能为空' }, { status: 400 })
  }

  const publishedAt = parsePublishedAt(body.publishedAt)
  if (publishedAt === null) {
    return NextResponse.json({ error: '发布时间格式不正确' }, { status: 400 })
  }

  try {
    const post = await savePost({
      title: body.title,
      slug: typeof body.slug === 'string' ? body.slug : undefined,
      summary: typeof body.summary === 'string' ? body.summary : undefined,
      contentMd: body.contentMd,
      coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl : undefined,
      status: body.status === 'published' ? 'published' : 'draft',
      isPinned: Boolean(body.isPinned),
      categoryName: typeof body.categoryName === 'string' ? body.categoryName : undefined,
      tagNames: parseTags(body.tagNames),
      publishedAt,
    })
    return NextResponse.json({ id: post.id, slug: post.slug })
  } catch (err) {
    console.error('创建文章失败:', err)
    return NextResponse.json({ error: '保存失败，请重试' }, { status: 500 })
  }
}
