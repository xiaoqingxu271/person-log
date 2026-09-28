import { createHash } from 'crypto'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/site-config'
import type { CommentStatus } from '@prisma/client'

/** 头像：邮箱 md5 匹配 Cravatar（国内可用的 Gravatar 镜像），无匹配时由其生成默认头像 */
export function avatarUrlFor(email: string, size = 80): string {
  const hash = createHash('md5').update(email.trim().toLowerCase()).digest('hex')
  return `https://cravatar.cn/avatar/${hash}?d=mp&s=${size}`
}

// ---- 反垃圾 F-27：同 IP 频率限制（内存版，重启清零，单实例足够） ----
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5
const recentByIp = new Map<string, number[]>()

export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recentByIp.set(ip, [...recent, now])
  return recent.length >= RATE_MAX
}

export interface CreateCommentInput {
  postId: number
  parentId: number | null
  authorName: string
  authorEmail: string
  authorUrl: string
  content: string
  ip: string
  userAgent: string
}

export type CreateCommentResult =
  | { ok: true; status: 'approved' | 'pending'; id: number }
  | { ok: false; error: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * 发表评论。游客默认「先审后显」；免审白名单邮箱直接通过；
 * 命中黑名单关键词的强制进入待审；博主回复直接通过并带 is_owner 标识。
 */
export async function createComment(
  input: CreateCommentInput,
  opts: { isOwner?: boolean } = {},
): Promise<CreateCommentResult> {
  const { isOwner = false } = opts

  const content = input.content.trim()
  if (!content || content.length > 2000) {
    return { ok: false, error: '评论内容需在 1~2000 字之间' }
  }

  if (!isOwner) {
    const name = input.authorName.trim()
    if (!name || name.length > 50) return { ok: false, error: '昵称不能为空且不超过 50 字' }
    const email = input.authorEmail.trim()
    if (!EMAIL_RE.test(email) || email.length > 200) return { ok: false, error: '邮箱格式不正确' }
    const url = input.authorUrl.trim()
    if (url && !/^https?:\/\//.test(url)) return { ok: false, error: '网址需以 http(s):// 开头' }
  }

  const post = await prisma.post.findUnique({ where: { id: input.postId }, select: { id: true } })
  if (!post) return { ok: false, error: '文章不存在' }

  if (input.parentId !== null) {
    // 只允许对已通过的一级评论进行楼中楼回复
    const parent = await prisma.comment.findUnique({ where: { id: input.parentId } })
    if (
      !parent ||
      parent.postId !== input.postId ||
      parent.status !== 'approved' ||
      parent.parentId !== null
    ) {
      return { ok: false, error: '回复的评论不存在或不可回复' }
    }
  }

  let status: 'approved' | 'pending' = 'pending'
  if (isOwner) {
    status = 'approved'
  } else {
    const cfg = await getSiteConfig()
    const whitelist = cfg.commentAutoApproveEmails
      .split(/[，,]/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
    if (whitelist.includes(input.authorEmail.trim().toLowerCase())) status = 'approved'

    const banned = cfg.commentBannedWords
      .split(/[，,]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (banned.length > 0) {
      const haystack = `${input.authorName} ${input.authorEmail} ${input.authorUrl} ${content}`
      if (banned.some((word) => haystack.includes(word))) status = 'pending'
    }
  }

  const created = await prisma.comment.create({
    data: {
      postId: input.postId,
      parentId: input.parentId,
      authorName: (isOwner ? input.authorName : input.authorName.trim()).slice(0, 50),
      authorEmail: (isOwner ? '' : input.authorEmail.trim()).slice(0, 200),
      authorUrl: input.authorUrl.trim().slice(0, 500),
      content: content.slice(0, 2000),
      status,
      ip: input.ip.slice(0, 45),
      userAgent: input.userAgent.slice(0, 500),
      isOwner,
    },
  })
  return { ok: true, status, id: created.id }
}

// ---- 前台查询 ----

export interface CommentView {
  id: number
  authorName: string
  authorUrl: string
  avatarUrl: string
  content: string
  status: CommentStatus
  isOwner: boolean
  createdAtISO: string
  replies: CommentView[]
}

/** 文章评论树（一级评论 + 楼中楼回复）；includeAll 供登录博主查看待审/已隐藏 */
export async function listCommentsForPost(postId: number, includeAll: boolean): Promise<CommentView[]> {
  const rows = await prisma.comment.findMany({
    where: { postId, ...(includeAll ? {} : { status: 'approved' }) },
    orderBy: { createdAt: 'asc' },
  })

  const views = new Map<number, CommentView>(
    rows.map((c) => [
      c.id,
      {
        id: c.id,
        authorName: c.authorName,
        authorUrl: c.authorUrl,
        avatarUrl: c.isOwner ? '' : avatarUrlFor(c.authorEmail),
        content: c.content,
        status: c.status,
        isOwner: c.isOwner,
        createdAtISO: c.createdAt.toISOString(),
        replies: [],
      },
    ]),
  )
  const tops: CommentView[] = []
  for (const row of rows) {
    const view = views.get(row.id)!
    if (row.parentId === null) tops.push(view)
    else views.get(row.parentId)?.replies.push(view)
  }
  return tops
}

// ---- 管理端 ----

export async function adminListComments() {
  // 枚举声明顺序 pending → approved → hidden，asc 即待审在前
  return prisma.comment.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    include: {
      post: { select: { title: true, slug: true } },
      parent: { select: { authorName: true } },
    },
  })
}

export async function setCommentStatus(id: number, status: 'approved' | 'hidden') {
  await prisma.comment.update({ where: { id }, data: { status } })
}

export async function deleteComment(id: number) {
  await prisma.comment.delete({ where: { id } })
}

export async function countPendingComments(): Promise<number> {
  return prisma.comment.count({ where: { status: 'pending' } })
}
