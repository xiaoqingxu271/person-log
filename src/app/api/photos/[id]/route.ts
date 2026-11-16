import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { updatePhoto, setPhotoVisible, deletePhoto } from '@/lib/photos'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

function parseId(id: string) {
  const n = Number(id)
  return Number.isInteger(n) ? n : null
}

/** 编辑照片 */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const photoId = parseId(id)
  if (photoId === null) return NextResponse.json({ error: '无效的 id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  try {
    const result = await updatePhoto(photoId, {
      title: typeof body.title === 'string' ? body.title : '',
      imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : '',
      description: typeof body.description === 'string' ? body.description : undefined,
      location: typeof body.location === 'string' ? body.location : undefined,
      takenAt: typeof body.takenAt === 'string' ? body.takenAt : undefined,
      width: typeof body.width === 'number' ? body.width : undefined,
      height: typeof body.height === 'number' ? body.height : undefined,
      isVisible: typeof body.isVisible === 'boolean' ? body.isVisible : undefined,
    })
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '照片不存在' }, { status: 404 })
  }
}

/** 切换显示/隐藏 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const photoId = parseId(id)
  if (photoId === null) return NextResponse.json({ error: '无效的 id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (typeof body?.isVisible !== 'boolean') {
    return NextResponse.json({ error: '无效的状态' }, { status: 400 })
  }

  try {
    await setPhotoVisible(photoId, body.isVisible)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '照片不存在' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { id } = await ctx.params
  const photoId = parseId(id)
  if (photoId === null) return NextResponse.json({ error: '无效的 id' }, { status: 400 })

  try {
    await deletePhoto(photoId)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '照片不存在' }, { status: 404 })
  }
}