// 定时发布 + 分类/标签合并迁移（需服务器与数据库运行）
import { createChecker, login, req, suffix, PrismaClient } from './lib.mjs'

const { ok, summary } = createChecker()

const loginRes = await login()
ok('登录成功', loginRes.status === 200 && loginRes.json?.ok === true, `status=${loginRes.status}`)
if (loginRes.status !== 200) process.exit(1)

const catA = `测试分类A_${suffix}`
const catB = `测试分类B_${suffix}`
const tagA = `测试标签A_${suffix}`
const tagB = `测试标签B_${suffix}`
let catAId, catBId, tagAId, tagBId

const createCatA = await req('/api/categories', { method: 'POST', body: { name: catA } })
ok('创建分类A', createCatA.status === 200, createCatA.text)
catAId = createCatA.json?.id
const createCatB = await req('/api/categories', { method: 'POST', body: { name: catB } })
ok('创建分类B', createCatB.status === 200, createCatB.text)
catBId = createCatB.json?.id
const createTagA = await req('/api/tags', { method: 'POST', body: { name: tagA } })
ok('创建标签A', createTagA.status === 200, createTagA.text)
tagAId = createTagA.json?.id
const createTagB = await req('/api/tags', { method: 'POST', body: { name: tagB } })
ok('创建标签B', createTagB.status === 200, createTagB.text)
tagBId = createTagB.json?.id

const dupCat = await req('/api/categories', { method: 'POST', body: { name: catA } })
ok('重复分类名被拒绝', dupCat.status === 409, `status=${dupCat.status}`)

const title = `预约测试_${suffix}`
const future = new Date(Date.now() + 3600_000).toISOString()
const created = await req('/api/posts', {
  method: 'POST',
  body: {
    title,
    contentMd: '# 定时发布测试\n\n正文内容。',
    status: 'published',
    categoryName: catA,
    tagNames: tagA,
    publishedAt: future,
  },
})
ok('创建定时文章', created.status === 200 && created.json?.id > 0, created.text)
const postId = created.json?.id
const slug = created.json?.slug

const badDate = await req('/api/posts', {
  method: 'POST',
  body: { title: '坏日期', contentMd: 'x', status: 'published', publishedAt: 'not-a-date' },
})
ok('非法发布时间返回 400', badDate.status === 400, `status=${badDate.status}`)

const notFoundShown = (r) =>
  r.status === 404 || r.text.includes('页面不存在') || r.text.includes('not-found')

const guestScheduled = await req(`/posts/${encodeURIComponent(slug)}`, { withCookie: false })
ok('游客访问定时文章显示 404', notFoundShown(guestScheduled), `status=${guestScheduled.status}`)

const adminScheduled = await req(`/posts/${encodeURIComponent(slug)}`)
ok(
  '登录用户可预览定时文章',
  adminScheduled.status === 200 && adminScheduled.text.includes('定时发布预览'),
)

const home = await req('/', { withCookie: false })
ok('首页不显示定时文章', !home.text.includes(title))

const feed = await req('/feed.xml', { withCookie: false })
ok('RSS 不包含定时文章', !feed.text.includes(title))

const adminList = await req('/admin/posts')
ok('后台列表显示定时文章', adminList.status === 200 && adminList.text.includes(title))
const rowStart = adminList.text.indexOf(title)
ok(
  '后台列表显示定时徽标',
  rowStart >= 0 && adminList.text.slice(rowStart, rowStart + 1200).includes('>定时<'),
  adminList.text.slice(rowStart, rowStart + 1200),
)

const editPage = await req(`/admin/posts/${postId}/edit`)
ok('编辑页可打开', editPage.status === 200 && editPage.text.includes(title))

const past = new Date(Date.now() - 60_000).toISOString()
const publishNow = await req(`/api/posts/${postId}`, {
  method: 'PUT',
  body: {
    title,
    contentMd: '# 已发布\n\n正文。',
    status: 'published',
    publishedAt: past,
    categoryName: catA,
    tagNames: tagA,
  },
})
ok('改为过去时间立即发布', publishNow.status === 200, publishNow.text)

const guestNow = await req(`/posts/${encodeURIComponent(slug)}`, { withCookie: false })
ok('游客可访问已到时间文章', guestNow.status === 200 && guestNow.text.includes(title))
const feedNow = await req('/feed.xml', { withCookie: false })
ok('RSS 包含已发布文章', feedNow.text.includes(title))

const reScheduled = await req(`/api/posts/${postId}`, {
  method: 'PUT',
  body: {
    title,
    contentMd: '# 再次定时\n\n正文。',
    status: 'published',
    publishedAt: future,
    categoryName: catA,
    tagNames: tagA,
  },
})
ok('可再次改为定时', reScheduled.status === 200, reScheduled.text)
const guestAgain = await req(`/posts/${encodeURIComponent(slug)}`, { withCookie: false })
ok('改回定时后游客再次显示 404', notFoundShown(guestAgain), `status=${guestAgain.status}`)

const mergeCat = await req(`/api/categories/${catAId}/merge`, {
  method: 'POST',
  body: { targetId: catBId },
})
ok('分类合并成功', mergeCat.status === 200, mergeCat.text)

const mergeTag = await req(`/api/tags/${tagAId}/merge`, {
  method: 'POST',
  body: { targetId: tagBId },
})
ok('标签合并成功', mergeTag.status === 200, mergeTag.text)

const prisma = new PrismaClient()
const dbPost = await prisma.post.findUnique({
  where: { id: postId },
  include: { category: true, tags: { include: { tag: true } } },
})
ok('文章分类已迁移到目标分类', dbPost?.category?.id === catBId, JSON.stringify(dbPost?.category))
ok(
  '文章标签已迁移到目标标签',
  dbPost?.tags.length === 1 && dbPost.tags[0].tag.id === tagBId,
  JSON.stringify(dbPost?.tags.map((t) => t.tag.name)),
)
const catAGone = await prisma.category.findUnique({ where: { id: catAId } })
const tagAGone = await prisma.tag.findUnique({ where: { id: tagAId } })
ok('源分类已删除', catAGone === null)
ok('源标签已删除', tagAGone === null)
await prisma.$disconnect()

const delPost = await req(`/api/posts/${postId}`, { method: 'DELETE' })
ok('测试文章已删除', delPost.status === 200, delPost.text)
const delCat = await req(`/api/categories/${catBId}`, { method: 'DELETE' })
ok('测试分类已删除', delCat.status === 200, delCat.text)
const delTag = await req(`/api/tags/${tagBId}`, { method: 'DELETE' })
ok('测试标签已删除', delTag.status === 200, delTag.text)

process.exit(summary() ? 0 : 1)
