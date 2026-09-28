import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { savePost, deletePost } from '@/lib/posts'

function parseTags(input: unknown): string[] {
  if (typeof input !== 'string') return []
  return input.split(/[，,、\s]+/).filter(Boolean)
}

interface Ctx {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const postId = Number(id)
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: '无效的文章 id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  if (
    !body ||
    typeof body.title !== 'string' ||
    !body.title.trim() ||
    typeof body.contentMd !== 'string'
  ) {
    return NextResponse.json({ error: '标题和正文不能为空' }, { status: 400 })
  }

  try {
    await savePost(
      {
        title: body.title,
        slug: typeof body.slug === 'string' ? body.slug : undefined,
        summary: typeof body.summary === 'string' ? body.summary : undefined,
        contentMd: body.contentMd,
        coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl : undefined,
        status: body.status === 'published' ? 'published' : 'draft',
        isPinned: Boolean(body.isPinned),
        categoryName: typeof body.categoryName === 'string' ? body.categoryName : undefined,
        tagNames: parseTags(body.tagNames),
      },
      postId,
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('更新文章失败:', err)
    return NextResponse.json({ error: '保存失败，请重试' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const postId = Number(id)
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: '无效的文章 id' }, { status: 400 })
  }

  try {
    await deletePost(postId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('删除文章失败:', err)
    return NextResponse.json({ error: '删除失败，文章可能不存在' }, { status: 500 })
  }
}
