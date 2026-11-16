import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { broadcastPostToSubscribers } from '@/lib/notifications'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

/** 向全部邮箱订阅者推送一篇已发布文章（仅管理员） */
export async function POST(_req: Request, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const postId = Number(id)
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: '无效的文章 id' }, { status: 400 })
  }

  const outcome = await broadcastPostToSubscribers(postId)
  if (!outcome.ok) {
    if (outcome.code === 'not_configured') {
      return NextResponse.json({ error: '未配置 SMTP，无法发送邮件' }, { status: 503 })
    }
    if (outcome.code === 'not_found') {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    return NextResponse.json({ error: '文章尚未发布，无法推送' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, ...outcome.result })
}
