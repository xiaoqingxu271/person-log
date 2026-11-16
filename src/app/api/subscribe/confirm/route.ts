import { NextRequest, NextResponse } from 'next/server'
import { confirmSubscriber } from '@/lib/subscribers'

export const runtime = 'nodejs'

/** 点击确认邮件后调用，把订阅从 pending 改为 confirmed */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const token = String(body?.token ?? '').trim().slice(0, 64)
  if (!token) {
    return NextResponse.json({ error: '缺少确认凭证' }, { status: 400 })
  }

  const subscriber = await confirmSubscriber(token)
  if (!subscriber) {
    return NextResponse.json({ error: '链接无效或已完成确认' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
