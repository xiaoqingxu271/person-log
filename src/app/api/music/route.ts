import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { createMusic } from '@/lib/music'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  const result = await createMusic({
    title: typeof body.title === 'string' ? body.title : '',
    artist: typeof body.artist === 'string' ? body.artist : '',
    coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl : undefined,
    audioUrl: typeof body.audioUrl === 'string' ? body.audioUrl : undefined,
    genre: typeof body.genre === 'string' ? body.genre : undefined,
    rating: typeof body.rating === 'number' ? body.rating : undefined,
    review: typeof body.review === 'string' ? body.review : undefined,
    listenUrl: typeof body.listenUrl === 'string' ? body.listenUrl : undefined,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, id: result.id })
}