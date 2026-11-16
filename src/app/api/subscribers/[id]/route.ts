import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { deleteSubscriber } from '@/lib/subscribers'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const subscriberId = Number(id)
  if (!Number.isInteger(subscriberId)) {
    return NextResponse.json({ error: '无效的订阅 id' }, { status: 400 })
  }

  try {
    await deleteSubscriber(subscriberId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '订阅不存在' }, { status: 404 })
  }
}
