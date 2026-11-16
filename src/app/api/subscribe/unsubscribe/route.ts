import { NextRequest, NextResponse } from 'next/server'
import { unsubscribeByToken } from '@/lib/subscribers'

export const runtime = 'nodejs'

/** 凭退订 token 移除订阅（放在 POST 中，避免邮件安全扫描器误触发） */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const token = typeof body?.token === 'string' ? body.token.trim() : ''
  if (!token || token.length > 64) {
    return NextResponse.json({ error: '退订链接无效' }, { status: 400 })
  }

  try {
    const removed = await unsubscribeByToken(token)
    if (!removed) {
      return NextResponse.json({ error: '订阅不存在或已退订' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '退订失败，请稍后再试' }, { status: 500 })
  }
}
