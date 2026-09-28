import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { setFriendVisible, deleteFriend } from '@/lib/friends'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

/** 切换友链显示/隐藏 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const friendId = Number(id)
  if (!Number.isInteger(friendId)) {
    return NextResponse.json({ error: '无效的 id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  if (typeof body?.isVisible !== 'boolean') {
    return NextResponse.json({ error: '无效的状态' }, { status: 400 })
  }

  try {
    await setFriendVisible(friendId, body.isVisible)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '友链不存在' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const friendId = Number(id)
  if (!Number.isInteger(friendId)) {
    return NextResponse.json({ error: '无效的 id' }, { status: 400 })
  }

  try {
    await deleteFriend(friendId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '友链不存在' }, { status: 404 })
  }
}
