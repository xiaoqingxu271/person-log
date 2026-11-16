import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { updateMusic, setMusicVisible, deleteMusic } from '@/lib/music'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

function parseId(id: string) {
  const n = Number(id)
  return Number.isInteger(n) ? n : null
}

/** 编辑专辑 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const musicId = parseId(id)
  if (musicId === null) return NextResponse.json({ error: '无效的 id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  try {
    const result = await updateMusic(musicId, {
      title: typeof body.title === 'string' ? body.title : '',
      artist: typeof body.artist === 'string' ? body.artist : '',
      coverUrl: typeof body.coverUrl === 'string' ? body.coverUrl : undefined,
      audioUrl: typeof body.audioUrl === 'string' ? body.audioUrl : undefined,
      genre: typeof body.genre === 'string' ? body.genre : undefined,
      rating: typeof body.rating === 'number' ? body.rating : undefined,
      review: typeof body.review === 'string' ? body.review : undefined,
      listenUrl: typeof body.listenUrl === 'string' ? body.listenUrl : undefined,
      isVisible: typeof body.isVisible === 'boolean' ? body.isVisible : undefined,
    })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '专辑不存在' }, { status: 404 })
  }
}

/** 切换显示/隐藏 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const musicId = parseId(id)
  if (musicId === null) return NextResponse.json({ error: '无效的 id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (typeof body?.isVisible !== 'boolean') {
    return NextResponse.json({ error: '无效的状态' }, { status: 400 })
  }

  try {
    await setMusicVisible(musicId, body.isVisible)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '专辑不存在' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const musicId = parseId(id)
  if (musicId === null) return NextResponse.json({ error: '无效的 id' }, { status: 400 })

  try {
    await deleteMusic(musicId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '专辑不存在' }, { status: 404 })
  }
}