import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { createComment, isRateLimited } from '@/lib/comments'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

/** 发表评论：游客（蜜罐 + 最短耗时 + 频率限制 + 先审后显）/ 博主回复（直接通过） */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  const user = await getSessionUser()
  const honeypot = typeof body.honeypot === 'string' ? body.honeypot : ''
  const elapsedMs = Number(body.elapsedMs) || 0
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const userAgent = req.headers.get('user-agent') ?? ''

  // 蜜罐字段被填写 → 判定为机器人，假装成功但不入库
  if (!user && honeypot) {
    return NextResponse.json({ ok: true, status: 'pending' })
  }
  // 正常手填 3 秒起步
  if (!user && elapsedMs < 3000) {
    return NextResponse.json({ error: '提交太快啦，请稍后再试' }, { status: 400 })
  }
  // 同 IP 频率限制
  if (!user && isRateLimited(ip)) {
    return NextResponse.json({ error: '评论太频繁了，请 10 分钟后再试' }, { status: 429 })
  }

  const postId = Number(body.postId)
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: '无效的文章' }, { status: 400 })
  }
  const parentId =
    body.parentId === null || body.parentId === undefined ? null : Number(body.parentId)
  if (body.parentId != null && !Number.isInteger(parentId)) {
    return NextResponse.json({ error: '无效的回复目标' }, { status: 400 })
  }

  let authorName = typeof body.authorName === 'string' ? body.authorName : ''
  let authorEmail = typeof body.authorEmail === 'string' ? body.authorEmail : ''
  const authorUrl = typeof body.authorUrl === 'string' ? body.authorUrl : ''

  if (user) {
    const owner = await prisma.user.findUnique({
      where: { username: user },
      select: { displayName: true, username: true },
    })
    authorName = owner?.displayName || owner?.username || '博主'
    authorEmail = ''
  }

  const result = await createComment(
    {
      postId,
      parentId,
      authorName,
      authorEmail,
      authorUrl,
      content: typeof body.content === 'string' ? body.content : '',
      ip,
      userAgent,
    },
    { isOwner: Boolean(user) },
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ ok: true, status: result.status, id: result.id })
}
