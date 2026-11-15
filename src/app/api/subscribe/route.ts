import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

/** 邮箱订阅：格式校验 + 幂等入库（重复订阅直接返回成功） */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = String(body?.email ?? '').trim().toLowerCase()
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: '邮箱格式不正确' }, { status: 400 })
  }

  try {
    await prisma.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '订阅失败，请稍后再试' }, { status: 500 })
  }
}