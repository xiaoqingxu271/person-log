import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { createFriend } from '@/lib/friends'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  const result = await createFriend({
    name: typeof body.name === 'string' ? body.name : '',
    url: typeof body.url === 'string' ? body.url : '',
    avatar: typeof body.avatar === 'string' ? body.avatar : undefined,
    description: typeof body.description === 'string' ? body.description : undefined,
  })
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ ok: true, id: result.id })
}
