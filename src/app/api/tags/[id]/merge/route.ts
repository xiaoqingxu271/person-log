import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { mergeTag, taxonomyErrorResponse } from '@/lib/taxonomy'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, ctx: Ctx) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }

  const { id } = await ctx.params
  const sourceId = Number(id)
  if (!Number.isInteger(sourceId)) {
    return NextResponse.json({ error: '无效的标签 id' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)
  const targetId = Number((body as { targetId?: unknown } | null)?.targetId)
  if (!Number.isInteger(targetId)) {
    return NextResponse.json({ error: '请选择目标标签' }, { status: 400 })
  }

  try {
    await mergeTag(sourceId, targetId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return taxonomyErrorResponse(err)
  }
}
