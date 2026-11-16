import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/site-config'
import { SITE } from '@/lib/site'
import {
  broadcastEmail,
  confirmSubscriptionEmail,
  pendingCommentEmail,
  replyNotificationEmail,
} from '@/lib/email-templates'
import { isMailConfigured, mailOwnerAddress, sendMail } from '@/lib/mail'
import { isPostPublic } from '@/lib/post-visibility'

function publicPostUrl(slug: string): string {
  return `${SITE.url}/posts/${encodeURIComponent(slug)}`
}

/** 博主回复评论后通知被回复的访客；未配置 SMTP、对方是博主或无邮箱时静默跳过 */
export async function notifyCommentReply(replyId: number): Promise<void> {
  if (!isMailConfigured()) return

  const reply = await prisma.comment.findUnique({
    where: { id: replyId },
    include: {
      post: { select: { title: true, slug: true } },
      parent: true,
    },
  })
  if (!reply?.parent || !reply.isOwner) return
  const target = reply.parent
  if (target.isOwner || !target.authorEmail) return

  const cfg = await getSiteConfig()
  const mail = replyNotificationEmail({
    siteName: cfg.siteName,
    postTitle: reply.post.title,
    postUrl: publicPostUrl(reply.post.slug),
    parentAuthor: target.authorName,
    parentContent: target.content,
    replyContent: reply.content,
    parentId: target.id,
  })
  const result = await sendMail({ to: target.authorEmail, ...mail })
  if (!result.ok && !('skipped' in result)) {
    console.error('[mail] 回复通知发送失败：', result.error)
  }
}

/** 发送订阅确认邮件；返回是否成功（未配置 SMTP 时调用方已跳过发信） */
export async function sendSubscriptionConfirmation(
  email: string,
  confirmToken: string,
): Promise<boolean> {
  if (!isMailConfigured()) return false
  const cfg = await getSiteConfig()
  const mail = confirmSubscriptionEmail({
    siteName: cfg.siteName,
    confirmUrl: `${SITE.url}/subscribe/confirm?token=${encodeURIComponent(confirmToken)}`,
  })
  const result = await sendMail({ to: email, ...mail })
  if (!result.ok && !('skipped' in result)) {
    console.error('[mail] 订阅确认邮件发送失败：', result.error)
  }
  return result.ok
}

/** 游客评论进入待审队列后通知博主（收件地址取 MAIL_FROM） */
export async function notifyPendingComment(commentId: number): Promise<void> {
  if (!isMailConfigured()) return
  const to = mailOwnerAddress()
  if (!to) return

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { title: true, slug: true } } },
  })
  if (!comment || comment.status !== 'pending' || comment.isOwner) return

  const cfg = await getSiteConfig()
  const mail = pendingCommentEmail({
    siteName: cfg.siteName,
    postTitle: comment.post.title,
    postUrl: publicPostUrl(comment.post.slug),
    adminUrl: `${SITE.url}/admin/comments`,
    authorName: comment.authorName,
    content: comment.content,
  })
  const result = await sendMail({ to, ...mail })
  if (!result.ok && !('skipped' in result)) {
    console.error('[mail] 待审评论通知发送失败：', result.error)
  }
}

export type BroadcastResult = {
  total: number
  sent: number
  failed: number
  skipped: number
}

export type BroadcastOutcome =
  | { ok: true; result: BroadcastResult }
  | { ok: false; code: 'not_configured' | 'not_found' | 'not_public' }

const BROADCAST_CONCURRENCY = 5

/** 向全部订阅者推送一篇已发布文章，每人附带独立退订链接 */
export async function broadcastPostToSubscribers(postId: number): Promise<BroadcastOutcome> {
  if (!isMailConfigured()) return { ok: false, code: 'not_configured' }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) return { ok: false, code: 'not_found' }
  if (!isPostPublic(post)) return { ok: false, code: 'not_public' }

  const [subscribers, cfg] = await Promise.all([
    prisma.subscriber.findMany({
      where: { status: 'confirmed' },
      select: { email: true, token: true },
      orderBy: { createdAt: 'asc' },
    }),
    getSiteConfig(),
  ])

  const result: BroadcastResult = {
    total: subscribers.length,
    sent: 0,
    failed: 0,
    skipped: 0,
  }
  const postUrl = publicPostUrl(post.slug)
  const postTitle = post.title
  const postSummary = post.summary
  const queue = [...subscribers]

  async function worker() {
    for (;;) {
      const subscriber = queue.shift()
      if (!subscriber) return
      if (!subscriber.token) {
        result.skipped++
        continue
      }
      const mail = broadcastEmail({
        siteName: cfg.siteName,
        postTitle,
        summary: postSummary,
        postUrl,
        unsubscribeUrl: `${SITE.url}/unsubscribe?token=${encodeURIComponent(subscriber.token)}`,
      })
      const sent = await sendMail({ to: subscriber.email, ...mail })
      if (sent.ok) {
        result.sent++
      } else {
        result.failed++
        if (!('skipped' in sent)) {
          console.error('[mail] 订阅推送失败：', subscriber.email, sent.error)
        }
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(BROADCAST_CONCURRENCY, queue.length) }, () => worker()),
  )
  return { ok: true, result }
}
