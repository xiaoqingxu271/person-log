import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { setCommentStatus, deleteComment } from '@/lib/comments'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

/** 审核评论：通过 / 隐藏 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const commentId = Number(id)
  if (!Number.isInteger(commentId)) {
    return NextResponse.json({ error: '无效的评论 id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const status = body?.status
  if (status !== 'approved' && status !== 'hidden') {
    return NextResponse.json({ error: '无效的状态' }, { status: 400 })
  }

  try {
    await setCommentStatus(commentId, status)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '评论可能不存在' }, { status: 404 })
  }
}

/** 删除评论（连带其楼中楼回复） */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const commentId = Number(id)
  if (!Number.isInteger(commentId)) {
    return NextResponse.json({ error: '无效的评论 id' }, { status: 400 })
  }

  try {
    await deleteComment(commentId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '评论可能不存在' }, { status: 404 })
  }
}
