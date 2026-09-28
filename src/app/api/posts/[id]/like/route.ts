import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

interface Ctx {
  params: Promise<{ id: string }>
}

/** 点赞 +1（防重复由前端 localStorage 保证，见 like-button） */
export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params
  const postId = Number(id)
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: '无效的文章' }, { status: 400 })
  }

  try {
    const post = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    })
    return NextResponse.json({ likes: post.likes })
  } catch {
    return NextResponse.json({ error: '文章不存在' }, { status: 404 })
  }
}
