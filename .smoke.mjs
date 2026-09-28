// person-log 全量冒烟测试：M1 发布闭环 + M2 体验 + M3 互动
// 运行：node .smoke.mjs（服务器需在 localhost:3000 运行）
const base = 'http://localhost:3000'

// 1x1 透明 PNG
const PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

let pass = 0
let fail = 0
function check(name, ok, detail = '') {
  if (ok) pass++
  else fail++
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' ' + detail : ''}`)
}

async function main() {
  // ================= M1：发布闭环 =================
  let r = await fetch(`${base}/`)
  check('M1 首页 200', r.status === 200)

  const login = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123456' }),
  })
  check('M1 登录', login.ok)
  const cookie = login.headers.getSetCookie()[0].split(';')[0]

  const create = await fetch(`${base}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({
      title: 'M3 冒烟测试文章',
      summary: 'M3 测试用',
      contentMd: '# 标题一\n\n## 标题二\n\n正文',
      status: 'published',
    }),
  })
  const created = await create.json()
  check('M1 发布测试文章', create.ok && created.slug, created.slug ?? '')
  const testPostId = created.id

  r = await fetch(`${base}/posts/${created.slug}`)
  check('M1 游客可读测试文章', r.status === 200)

  const noAuthPost = await fetch(`${base}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'x', contentMd: 'x' }),
  })
  check('M1 未登录发文被拒(401)', noAuthPost.status === 401)

  // ================= M2：体验 =================
  r = await fetch(`${base}/search?q=M3`)
  check('M2 搜索命中', r.status === 200 && (await r.text()).includes('M3 冒烟测试文章'))

  const form = new FormData()
  form.append('file', new Blob([Buffer.from(PNG_B64, 'base64')], { type: 'image/png' }), 't.png')
  const up = await fetch(`${base}/api/uploads`, { method: 'POST', headers: { cookie }, body: form })
  const upData = await up.json().catch(() => ({}))
  check('M2 上传图片', up.ok && typeof upData.url === 'string')

  r = await fetch(`${base}/api/uploads/%2e%2e/%2e%2e/.env`)
  check('M2 目录穿越被拦截', r.status !== 200, `status=${r.status}`)

  const exp = await fetch(`${base}/api/export`, { headers: { cookie } })
  const expBuf = Buffer.from(await exp.arrayBuffer())
  check('M2 导出 zip', exp.status === 200 && expBuf.subarray(0, 2).toString() === 'PK')

  // ================= M3：互动 =================
  // RSS
  r = await fetch(`${base}/feed.xml`)
  const feed = await r.text()
  check(
    'M3 RSS 订阅源',
    r.status === 200 && r.headers.get('content-type').includes('rss+xml') && feed.includes('<rss') && feed.includes('Hello, person-log'),
  )

  // 浏览量展示
  r = await fetch(`${base}/posts/hello-person-log`)
  const helloPage = await r.text()
  check('M3 浏览量展示', helloPage.includes('次阅读'))

  // 点赞
  const like1 = await fetch(`${base}/api/posts/${testPostId}/like`, { method: 'POST' })
  const like1Data = await like1.json().catch(() => ({}))
  const like2 = await fetch(`${base}/api/posts/${testPostId}/like`, { method: 'POST' })
  const like2Data = await like2.json().catch(() => ({}))
  check(
    'M3 点赞接口',
    like1.ok && like2.ok && like2Data.likes === like1Data.likes + 1,
    `${like1Data.likes} → ${like2Data.likes}`,
  )

  // ---- 评论：游客先审后显 ----
  const guestComment = {
    postId: testPostId,
    parentId: null,
    authorName: '测试访客',
    authorEmail: 'guest@example.com',
    authorUrl: '',
    content: 'M3 冒烟测试评论内容',
    honeypot: '',
    elapsedMs: 5000,
  }
  const c1 = await fetch(`${base}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(guestComment),
  })
  const c1Data = await c1.json().catch(() => ({}))
  check('M3 游客评论进入待审', c1.ok && c1Data.status === 'pending', JSON.stringify(c1Data))
  const guestCommentId = c1Data.id

  r = await fetch(`${base}/posts/${created.slug}`)
  check('M3 待审评论对游客不可见', !(await r.text()).includes('M3 冒烟测试评论内容'))

  // 蜜罐：假装成功但不入库
  const spam = await fetch(`${base}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...guestComment, content: 'HONEYPOT_SPAM_TEST', honeypot: 'http://spam' }),
  })
  check('M3 蜜罐静默丢弃', spam.ok)

  // 提交过快
  const fast = await fetch(`${base}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...guestComment, elapsedMs: 100 }),
  })
  check('M3 提交过快被拒(400)', fast.status === 400)

  // 后台管理
  r = await fetch(`${base}/admin/comments`, { headers: { cookie } })
  const adminCommentsPage = await r.text()
  check('M3 后台评论页可见待审评论', r.status === 200 && adminCommentsPage.includes('M3 冒烟测试评论内容'))
  check('M3 蜜罐评论确实未入库', !adminCommentsPage.includes('HONEYPOT_SPAM_TEST'))

  // 审核通过 → 游客可见 + Cravatar 头像
  const approve = await fetch(`${base}/api/comments/${guestCommentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ status: 'approved' }),
  })
  check('M3 审核通过', approve.ok)
  r = await fetch(`${base}/posts/${created.slug}`)
  const approvedPage = await r.text()
  check('M3 通过后游客可见', approvedPage.includes('M3 冒烟测试评论内容'))
  check('M3 Cravatar 头像', approvedPage.includes('cravatar.cn'))

  // 博主回复（楼中楼，直接展示）
  const reply = await fetch(`${base}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ postId: testPostId, parentId: guestCommentId, content: 'M3 博主回复测试' }),
  })
  const replyData = await reply.json().catch(() => ({}))
  check('M3 博主回复直接通过', reply.ok && replyData.status === 'approved')
  r = await fetch(`${base}/posts/${created.slug}`)
  const replyPage = await r.text()
  check('M3 回复在前台展示', replyPage.includes('M3 博主回复测试'))
  check('M3 博主身份标识', replyPage.includes('>博主<'))

  // 免审白名单
  await fetch(`${base}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ commentAutoApproveEmails: 'vip@example.com' }),
  })
  const white = await fetch(`${base}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...guestComment, authorEmail: 'vip@example.com', content: 'M3 白名单评论' }),
  })
  const whiteData = await white.json().catch(() => ({}))
  check('M3 白名单邮箱免审直发', white.ok && whiteData.status === 'approved')

  // 游客调用管理接口被拒
  const guestPatch = await fetch(`${base}/api/comments/${guestCommentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' }),
  })
  check('M3 游客审核被拒(401)', guestPatch.status === 401)

  // ================= M5：长期演进 =================
  r = await fetch(`${base}/moments`)
  check('M5 说说页 200', r.status === 200)
  r = await fetch(`${base}/friends`)
  check('M5 友链页 200', r.status === 200)

  r = await fetch(`${base}/posts/hello-person-log`)
  check('M5 结构化数据 JSON-LD', (await r.text()).includes('application/ld+json'))

  const moment = await fetch(`${base}/api/moments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ content: 'M5 冒烟测试说说' }),
  })
  const momentData = await moment.json().catch(() => ({}))
  check('M5 发布说说', moment.ok, JSON.stringify(momentData))
  r = await fetch(`${base}/moments`)
  check('M5 说说前台可见', (await r.text()).includes('M5 冒烟测试说说'))
  const guestMoment = await fetch(`${base}/api/moments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: '游客说说' }),
  })
  check('M5 游客发说说被拒(401)', guestMoment.status === 401)

  const friend = await fetch(`${base}/api/friends`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ name: 'M5 测试友链', url: 'https://example.com', description: '测试' }),
  })
  const friendData = await friend.json().catch(() => ({}))
  check('M5 添加友链', friend.ok)
  r = await fetch(`${base}/friends`)
  check('M5 友链前台可见', (await r.text()).includes('M5 测试友链'))

  r = await fetch(`${base}/admin`, { headers: { cookie } })
  check('M5 数据看板', r.status === 200 && (await r.text()).includes('最近 14 天浏览'))

  const relPost = await fetch(`${base}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ title: 'M5 相关文章测试', contentMd: 'x', status: 'published', tagNames: '建站' }),
  })
  const relData = await relPost.json().catch(() => ({}))
  check('M5 发布同标签文章', relPost.ok)
  r = await fetch(`${base}/posts/hello-person-log`)
  const relPage = await r.text()
  check('M5 相关文章推荐', relPage.includes('相关文章') && relPage.includes('M5 相关文章测试'))

  // ================= 清理 =================
  for (const id of [guestCommentId, replyData.id, whiteData.id].filter(Boolean)) {
    await fetch(`${base}/api/comments/${id}`, { method: 'DELETE', headers: { cookie } })
  }
  if (momentData.id) {
    await fetch(`${base}/api/moments?id=${momentData.id}`, { method: 'DELETE', headers: { cookie } })
  }
  if (friendData.id) {
    await fetch(`${base}/api/friends/${friendData.id}`, { method: 'DELETE', headers: { cookie } })
  }
  if (relData.id) {
    await fetch(`${base}/api/posts/${relData.id}`, { method: 'DELETE', headers: { cookie } })
  }
  if (testPostId) {
    await fetch(`${base}/api/posts/${testPostId}`, { method: 'DELETE', headers: { cookie } })
  }
  await fetch(`${base}/api/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie },
    body: JSON.stringify({ commentAutoApproveEmails: '' }),
  })
  console.log('\n（测试数据已清理）')

  console.log(`\n结果：${pass} 通过，${fail} 失败`)
  if (fail > 0) process.exitCode = 1
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
