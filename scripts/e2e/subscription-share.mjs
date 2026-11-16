// 文章分享/版权 + 邮箱订阅闭环（需服务器与数据库运行）
import { createChecker, login, req, requireFromRepo, suffix, PrismaClient } from './lib.mjs'

const { ok, summary } = createChecker()
const QRCode = requireFromRepo('qrcode')

const loginRes = await login()
ok('登录成功', loginRes.status === 200 && loginRes.json?.ok === true, `status=${loginRes.status}`)
if (loginRes.status !== 200) process.exit(1)

const qr = await QRCode.toDataURL('https://example.com/post', { width: 120 })
ok('二维码库可生成 data URL', typeof qr === 'string' && qr.startsWith('data:image/png;base64,'))

const shareTitle = `分享测试_${suffix}`
const created = await req('/api/posts', {
  method: 'POST',
  body: { title: shareTitle, contentMd: '# 分享测试\n\n正文内容。', status: 'published' },
})
ok('创建分享测试文章', created.status === 200 && created.json?.id > 0, created.text)
const sharePostId = created.json?.id
const shareSlug = created.json?.slug

if (shareSlug) {
  const page = await req(`/posts/${encodeURIComponent(shareSlug)}`, { withCookie: false })
  ok('文章页包含版权声明', page.text.includes('版权声明'))
  ok('文章页包含 CC 协议', page.text.includes('CC BY-NC-SA 4.0'))
  ok('文章页包含分享模块', page.text.includes('分享本文') && page.text.includes('复制链接'))
  ok('文章页包含微博/X/二维码入口', page.text.includes('微博') && page.text.includes('二维码'))
  ok(
    '文章页输出 OG 分享图',
    page.text.includes('property="og:image"') && page.text.includes('/images/og-default.jpg'),
  )
}

const email = `subtest_${suffix}@example.com`
const sub = await req('/api/subscribe', { method: 'POST', body: { email }, withCookie: false })
ok('游客可提交订阅', sub.status === 200 && sub.json?.ok === true, sub.text)
ok('未配置 SMTP 时订阅直接生效', sub.json?.confirmationRequired === false, sub.text)

const prisma = new PrismaClient()
const row = await prisma.subscriber.findUnique({ where: { email } })
ok(
  '订阅已入库且生成退订 token',
  Boolean(row) && typeof row.token === 'string' && row.token.length >= 32,
)
const token = row?.token ?? ''

const adminPage = await req('/admin/subscribers')
ok('后台订阅页可打开并显示邮箱', adminPage.status === 200 && adminPage.text.includes(email))
ok('后台订阅页显示已确认状态', adminPage.text.includes('已确认'))

const guestAdmin = await req('/admin/subscribers', { withCookie: false })
ok('未登录访问后台订阅页被重定向', guestAdmin.status === 307, `status=${guestAdmin.status}`)

const csv = await req('/api/subscribers/export')
ok(
  'CSV 导出成功',
  csv.status === 200 && (csv.headers.get('content-type') ?? '').includes('text/csv'),
)
ok('CSV 包含邮箱与退订链接', csv.text.includes(email) && csv.text.includes('/unsubscribe?token='))

const csvGuest = await req('/api/subscribers/export', { withCookie: false })
ok('未登录导出被拒绝', csvGuest.status === 401, `status=${csvGuest.status}`)

const notifyGuest = await req(`/api/posts/${sharePostId ?? 1}/notify`, {
  method: 'POST',
  withCookie: false,
})
ok('未登录推送订阅邮件被拒绝', notifyGuest.status === 401, `status=${notifyGuest.status}`)

const testMailGuest = await req('/api/settings/test-mail', {
  method: 'POST',
  withCookie: false,
})
ok('未登录发送测试邮件被拒绝', testMailGuest.status === 401, `status=${testMailGuest.status}`)

const pendingEmail = `pending_${suffix}@example.com`
await prisma.subscriber.create({
  data: {
    email: pendingEmail,
    token: `pendtok_${suffix}`,
    status: 'pending',
    confirmToken: `pendcfm_${suffix}`,
  },
})
const pendingPage = await req('/admin/subscribers')
ok(
  '后台显示待确认订阅',
  pendingPage.status === 200 &&
    pendingPage.text.includes(pendingEmail) &&
    pendingPage.text.includes('待确认'),
)
const pendingCsv = await req('/api/subscribers/export')
ok('CSV 不含待确认邮箱', !pendingCsv.text.includes(pendingEmail))

const badConfirm = await req('/api/subscribe/confirm', {
  method: 'POST',
  body: { token: 'deadbeef' },
  withCookie: false,
})
ok('无效确认凭证返回 404', badConfirm.status === 404, `status=${badConfirm.status}`)

const confirmPage = await req('/subscribe/confirm?token=deadbeef', { withCookie: false })
ok(
  '确认页可访问并展示说明',
  confirmPage.status === 200 && confirmPage.text.includes('确认订阅博客更新'),
  `status=${confirmPage.status}`,
)
await prisma.subscriber.delete({ where: { email: pendingEmail } })

const unsubPage = await req(`/unsubscribe?token=${encodeURIComponent(token)}`, { withCookie: false })
ok(
  '退订页显示打码邮箱',
  unsubPage.status === 200 &&
    unsubPage.text.includes(`${email[0]}***@example.com`) &&
    unsubPage.text.includes('确认退订'),
  unsubPage.text.slice(0, 200),
)

const invalidPage = await req('/unsubscribe?token=deadbeef', { withCookie: false })
ok('无效 token 显示失效提示', invalidPage.status === 200 && invalidPage.text.includes('链接无效'))

const unsub = await req('/api/subscribe/unsubscribe', {
  method: 'POST',
  body: { token },
  withCookie: false,
})
ok('自助退订成功', unsub.status === 200 && unsub.json?.ok === true, unsub.text)
const gone = await prisma.subscriber.findUnique({ where: { email } })
ok('退订后记录已删除', gone === null)

const unsubAgain = await req('/api/subscribe/unsubscribe', {
  method: 'POST',
  body: { token },
  withCookie: false,
})
ok('重复退订返回 404', unsubAgain.status === 404, `status=${unsubAgain.status}`)

const email2 = `subdel_${suffix}@example.com`
await req('/api/subscribe', { method: 'POST', body: { email: email2 }, withCookie: false })
const row2 = await prisma.subscriber.findUnique({ where: { email: email2 } })
ok('第二个订阅已入库', Boolean(row2?.id))

const delGuest = await req(`/api/subscribers/${row2?.id}`, { method: 'DELETE', withCookie: false })
ok('未登录删除订阅被拒绝', delGuest.status === 401, `status=${delGuest.status}`)

const delAdmin = await req(`/api/subscribers/${row2?.id}`, { method: 'DELETE' })
ok('后台删除订阅成功', delAdmin.status === 200 && delAdmin.json?.ok === true, delAdmin.text)
const gone2 = await prisma.subscriber.findUnique({ where: { id: row2?.id } })
ok('删除后记录不存在', gone2 === null)
await prisma.$disconnect()

if (sharePostId) {
  const delSharePost = await req(`/api/posts/${sharePostId}`, { method: 'DELETE' })
  ok('分享测试文章已删除', delSharePost.status === 200, delSharePost.text)
}

process.exit(summary() ? 0 : 1)
