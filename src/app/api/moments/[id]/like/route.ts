import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

/** 说说点赞 +1（防重复由前端 localStorage 保证，见 moment-card） */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const momentId = Number(id)
  if (!Number.isInteger(momentId)) {
    return NextResponse.json({ error: '无效的说说' }, { status: 400 })
  }

  try {
    const moment = await prisma.moment.update({
      where: { id: momentId },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    })
    return NextResponse.json({ likes: moment.likes })
  } catch {
    return NextResponse.json({ error: '说说不存在' }, { status: 404 })
  }
}