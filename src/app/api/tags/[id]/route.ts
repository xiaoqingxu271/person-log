import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { deleteTag, parseTaxonomyInput, taxonomyErrorResponse, updateTag } from '@/lib/taxonomy'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

async function requireId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params
  const value = Number(id)
  return Number.isInteger(value) ? value : null
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  const id = await requireId(ctx)
  if (id === null) return NextResponse.json({ error: '无效的标签 id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  try {
    await updateTag(id, parseTaxonomyInput(body, false))
    return NextResponse.json({ ok: true })
  } catch (err) {
    return taxonomyErrorResponse(err)
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  const id = await requireId(ctx)
  if (id === null) return NextResponse.json({ error: '无效的标签 id' }, { status: 400 })

  try {
    await deleteTag(id)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return taxonomyErrorResponse(err)
  }
}
