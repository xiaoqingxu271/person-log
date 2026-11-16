import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { createPhoto } from '@/lib/photos'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  const result = await createPhoto({
    title: typeof body.title === 'string' ? body.title : '',
    imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : '',
    description: typeof body.description === 'string' ? body.description : undefined,
    location: typeof body.location === 'string' ? body.location : undefined,
    takenAt: typeof body.takenAt === 'string' ? body.takenAt : undefined,
    width: typeof body.width === 'number' ? body.width : undefined,
    height: typeof body.height === 'number' ? body.height : undefined,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, id: result.id })
}