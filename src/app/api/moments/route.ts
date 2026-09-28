import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { createMoment, deleteMoment } from '@/lib/moments'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body.content !== 'string') {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  const result = await createMoment({
    content: body.content,
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : undefined,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, id: result.id })
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const id = Number(new URL(req.url).searchParams.get('id'))
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: '无效的 id' }, { status: 400 })
  }
  try {
    await deleteMoment(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '说说不存在' }, { status: 404 })
  }
}
