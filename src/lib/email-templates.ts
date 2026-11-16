import { SITE } from '@/lib/site'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function excerpt(value: string, max: number): string {
  const text = value.trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}

const wrap = (siteName: string, body: string) => `
  <div style="margin:0;padding:24px;background:#f5f5f4;font-family:-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#292524">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e7e5e4">
      ${body}
      <p style="margin:24px 0 0;font-size:12px;color:#a8a29e">此邮件由 ${escapeHtml(siteName)} 自动发送，请勿直接回复。</p>
    </div>
  </div>`

export function replyNotificationEmail(input: {
  siteName: string
  postTitle: string
  postUrl: string
  parentAuthor: string
  parentContent: string
  replyContent: string
  parentId: number
}) {
  const link = `${input.postUrl}#comment-${input.parentId}`
  const parent = excerpt(input.parentContent, 160)
  const reply = excerpt(input.replyContent, 600)
  return {
    subject: `[${input.siteName}] 你的评论收到了回复`,
    text: [
      `你好，${input.parentAuthor}：`,
      '',
      `你在《${input.postTitle}》下的评论收到了博主回复。`,
      '',
      `你的评论：${parent}`,
      `博主回复：${reply}`,
      '',
      `查看完整讨论：${link}`,
      '',
      `—— ${input.siteName}（${SITE.url}）`,
    ].join('\n'),
    html: wrap(
      input.siteName,
      `<h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">你的评论收到了回复</h2>
       <p style="margin:0 0 16px;font-size:14px;line-height:1.7">你好，${escapeHtml(input.parentAuthor)}：你在《${escapeHtml(input.postTitle)}》下的评论收到了博主回复。</p>
       <div style="padding:12px 16px;border-left:3px solid #d6d3d1;background:#fafaf9;font-size:13px;line-height:1.7;color:#57534e;margin-bottom:12px">${escapeHtml(parent)}</div>
       <div style="padding:12px 16px;border-left:3px solid #f97316;background:#fff7ed;font-size:14px;line-height:1.7;color:#44403c">${escapeHtml(reply)}</div>
       <p style="margin:24px 0 0"><a href="${link}" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#1c1917;color:#ffffff;font-size:14px;text-decoration:none">查看完整讨论</a></p>`,
    ),
  }
}

export function smtpTestEmail(input: { siteName: string }) {
  return {
    subject: `[${input.siteName}] SMTP 测试邮件`,
    text: [
      `这是一封来自 ${input.siteName} 后台的测试邮件。`,
      '',
      '收到这封邮件说明 SMTP 配置已生效，评论回复通知、订阅确认与新文章群发可以正常发信。',
    ].join('\n'),
    html: wrap(
      input.siteName,
      `<h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">SMTP 配置已生效</h2>
       <p style="margin:0;font-size:14px;line-height:1.7;color:#57534e">这是一封来自 ${escapeHtml(input.siteName)} 后台的测试邮件。收到这封邮件说明评论回复通知、订阅确认与新文章群发可以正常发信。</p>`,
    ),
  }
}

export function confirmSubscriptionEmail(input: {
  siteName: string
  confirmUrl: string
}) {
  return {
    subject: `[${input.siteName}] 确认订阅更新通知`,
    text: [
      `你正在订阅 ${input.siteName} 的更新通知。`,
      '',
      `请点击下面的链接完成确认：`,
      input.confirmUrl,
      '',
      '确认后才会收到新文章邮件；若非本人操作，忽略本邮件即可，不会产生任何订阅。',
    ].join('\n'),
    html: wrap(
      input.siteName,
      `<h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">确认订阅更新通知</h2>
       <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#57534e">你正在订阅 ${escapeHtml(input.siteName)} 的更新通知。点击下方按钮完成确认，之后才会收到新文章邮件。</p>
       <p style="margin:0 0 20px"><a href="${input.confirmUrl}" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#1c1917;color:#ffffff;font-size:14px;text-decoration:none">确认订阅</a></p>
       <p style="margin:0;font-size:12px;line-height:1.7;color:#a8a29e">若非本人操作，忽略本邮件即可，不会产生任何订阅。</p>`,
    ),
  }
}

export function pendingCommentEmail(input: {
  siteName: string
  postTitle: string
  postUrl: string
  adminUrl: string
  authorName: string
  content: string
}) {
  const content = excerpt(input.content, 400)
  return {
    subject: `[${input.siteName}] 新评论待审核：${input.postTitle}`,
    text: [
      `《${input.postTitle}》收到一条待审核评论。`,
      '',
      `${input.authorName}：${content}`,
      '',
      `审核：${input.adminUrl}`,
      `文章：${input.postUrl}`,
    ].join('\n'),
    html: wrap(
      input.siteName,
      `<h2 style="margin:0 0 16px;font-size:18px;color:#1c1917">新评论待审核</h2>
       <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#57534e">《${escapeHtml(input.postTitle)}》收到一条待审核评论。</p>
       <div style="padding:12px 16px;border-left:3px solid #f97316;background:#fff7ed;font-size:14px;line-height:1.7;color:#44403c"><strong>${escapeHtml(input.authorName)}</strong>：${escapeHtml(content)}</div>
       <p style="margin:24px 0 0"><a href="${input.adminUrl}" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#1c1917;color:#ffffff;font-size:14px;text-decoration:none">去审核评论</a></p>`,
    ),
  }
}

export function broadcastEmail(input: {
  siteName: string
  postTitle: string
  summary: string
  postUrl: string
  unsubscribeUrl: string
}) {
  const summary = excerpt(input.summary, 300)
  return {
    subject: `[${input.siteName}] 新文章：${input.postTitle}`,
    text: [
      `${input.siteName} 更新了一篇文章：`,
      '',
      `《${input.postTitle}》`,
      ...(summary ? ['', summary] : []),
      '',
      `阅读全文：${input.postUrl}`,
      '',
      `不想再收到邮件？退订：${input.unsubscribeUrl}`,
    ].join('\n'),
    html: wrap(
      input.siteName,
      `<p style="margin:0 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#f97316">New post</p>
       <h2 style="margin:0 0 16px;font-size:22px;line-height:1.4;color:#1c1917">${escapeHtml(input.postTitle)}</h2>
       ${summary ? `<p style="margin:0 0 20px;font-size:14px;line-height:1.8;color:#57534e">${escapeHtml(summary)}</p>` : ''}
       <p style="margin:0"><a href="${input.postUrl}" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#1c1917;color:#ffffff;font-size:14px;text-decoration:none">阅读全文</a></p>
       <p style="margin:24px 0 0;font-size:12px;color:#a8a29e">不想再收到邮件？<a href="${input.unsubscribeUrl}" style="color:#78716c">点此退订</a></p>`,
    ),
  }
}
