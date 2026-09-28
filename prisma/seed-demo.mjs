// 演示数据填充脚本（本地效果预览用，可重复执行）
// 运行：node prisma/seed-demo.mjs
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function daysAgo(n, hour = 10) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, (n * 13) % 60, 0, 0)
  return d
}

const categories = [
  { name: '技术笔记', slug: '技术笔记', description: '开发踩坑与实践总结' },
  { name: '生活', slug: '生活', description: '日常记录与随想' },
  { name: '阅读', slug: '阅读', description: '读书笔记与摘录' },
]

const tags = ['前端', 'Next.js', 'CSS', 'Docker', '后端', '效率', '工具', '生活', '随笔', '读书']

const posts = [
  {
    title: 'Next.js 16 App Router 实践小结',
    slug: 'nextjs-app-router-notes',
    summary: '从 Pages Router 迁移到 App Router 的三个月里，踩过的坑和一些真香瞬间。',
    cover: '/images/covers/code.jpg',
    category: '技术笔记',
    tags: ['前端', 'Next.js'],
    daysAgo: 2,
    views: 863,
    likes: 31,
    pinned: true,
    content: [
      '# App Router 实践小结',
      '',
      '服务端组件、流式渲染、嵌套布局……三个月用下来，记录一些体感。',
      '',
      '## 服务端组件是真的省心',
      '',
      '数据获取直接写在组件里，不再需要 `useEffect` + 状态管理的样板代码：',
      '',
      '```tsx',
      'export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {',
      '  const { slug } = await params',
      '  const post = await getPostBySlug(slug)',
      '  if (!post) notFound()',
      '  return <article>{post.title}</article>',
      '}',
      '```',
      '',
      '## 值得注意的点',
      '',
      '1. `params` 和 `searchParams` 都是 Promise，必须 `await`',
      '2. 客户端组件要显式标注 `"use client"`，谨慎控制边界',
      '3. `revalidatePath` 在表单提交后非常好用',
      '',
      '> 结论：新项目无脑上 App Router，老项目按页面灰度迁移。',
      '',
      '- [x] 服务端组件',
      '- [x] 流式渲染',
      '- [ ] Partial Prerendering',
    ].join('\n'),
  },
  {
    title: 'Docker 部署 Node 应用踩坑记',
    slug: 'docker-node-deploy-pitfalls',
    summary: '镜像体积从 1.2GB 瘦身到 180MB 的完整过程，附 Dockerfile 模板。',
    cover: '/images/covers/desk.jpg',
    category: '技术笔记',
    tags: ['Docker', '后端'],
    daysAgo: 9,
    views: 547,
    likes: 18,
    pinned: false,
    content: [
      '# Docker 部署 Node 应用踩坑记',
      '',
      '第一次把个人项目容器化部署，记录几个印象最深的坑。',
      '',
      '## 多阶段构建是必须的',
      '',
      '```dockerfile',
      'FROM node:22-alpine AS deps',
      'COPY package.json package-lock.json* ./',
      'RUN npm ci',
      '',
      'FROM node:22-alpine AS runner',
      'WORKDIR /app',
      'COPY --from=deps /app/node_modules ./node_modules',
      'COPY . .',
      'CMD ["node", "server.js"]',
      '```',
      '',
      '## 三个坑',
      '',
      '- `.dockerignore` 忘记排除 `node_modules`，构建上下文直接 800MB',
      '- 时区问题：容器默认 UTC，写入数据库的时间差了 8 小时',
      '- 健康检查要用 `CMD-SHELL` 才能展开环境变量',
      '',
      '> 瘦身成果：**1.2GB → 180MB**，构建时间也从 4 分钟降到 40 秒。',
    ].join('\n'),
  },
  {
    title: '周末的咖啡馆漫游',
    slug: 'cafe-weekend-walk',
    summary: '不带电脑，只带一本书和相机，把附近三条街的咖啡馆坐了个遍。',
    cover: '/images/covers/coffee.jpg',
    category: '生活',
    tags: ['生活', '随笔'],
    daysAgo: 5,
    views: 326,
    likes: 22,
    pinned: false,
    content: [
      '# 周末的咖啡馆漫游',
      '',
      '周六早上九点出门， deliberately 不带电脑，只塞了一本薄薄的小说和相机。',
      '',
      '## 第一站：转角的老咖啡店',
      '',
      '老板娘记得每位熟客的口味，奶泡打得绵密，拉花是一只歪歪扭扭的小熊。',
      '',
      '## 第二站：社区图书馆隔壁',
      '',
      '点了一杯手冲，耶加雪菲的果酸很明显。窗外有人遛狗、有人吵架、有人拍婚纱照。',
      '',
      '> 原来周末不需要做什么大事，把节奏放慢就足够治愈。',
      '',
      '回家路上买了两个可颂，一个当晚餐，一个当明天的早餐。',
    ].join('\n'),
  },
  {
    title: '读《置身事内》：理解中国政府与经济',
    slug: 'book-notes-inside-china-economy',
    summary: '一本难得的通俗读物，把土地财政、招商引资讲得明明白白。',
    cover: '/images/covers/books.jpg',
    category: '阅读',
    tags: ['读书'],
    daysAgo: 16,
    views: 289,
    likes: 14,
    pinned: false,
    content: [
      '# 读《置身事内》',
      '',
      '兰小欢教授的这本书，把「地方政府」这台机器怎么运转讲得深入浅出。',
      '',
      '## 印象最深的三个概念',
      '',
      '1. **土地财政**：卖地收入支撑了城市建设，也埋下了泡沫',
      '2. **招商引资竞争**：地方政府像公司一样互相抢项目',
      '3. **城投债**：算不清的账，还不完的息',
      '',
      '## 一点感想',
      '',
      '> 看懂规则，才能理解身边正在发生的事。',
      '',
      '推荐指数：⭐⭐⭐⭐⭐',
    ].join('\n'),
  },
  {
    title: 'CSS 网格布局速查手册',
    slug: 'css-grid-cheatsheet',
    summary: '把 grid-template-areas、minmax、auto-fill 这些常用招式整理成一页速查。',
    cover: '/images/covers/plant.jpg',
    category: '技术笔记',
    tags: ['前端', 'CSS'],
    daysAgo: 24,
    views: 412,
    likes: 19,
    pinned: false,
    content: [
      '# CSS Grid 速查',
      '',
      '## 基础三件套',
      '',
      '```css',
      '.layout {',
      '  display: grid;',
      '  grid-template-columns: 240px 1fr;',
      '  grid-template-rows: auto 1fr auto;',
      '  gap: 16px;',
      '}',
      '```',
      '',
      '## 响应式卡片墙',
      '',
      '```css',
      '.cards {',
      '  display: grid;',
      '  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));',
      '}',
      '```',
      '',
      '## 记忆要点',
      '',
      '- `fr` 是「剩余空间的比例」，不是固定值',
      '- `auto-fill` 与 `auto-fit` 的区别在空轨道是否折叠',
      '- `minmax()` 几乎能用在任何尺寸定义处',
    ].join('\n'),
  },
  {
    title: '我的 2026 开发工具清单',
    slug: 'my-2026-dev-toolbox',
    summary: '终端、编辑器、笔记、容器……这一年沉淀下来的趁手家伙事儿。',
    cover: '/images/covers/desk.jpg',
    category: '技术笔记',
    tags: ['效率', '工具'],
    daysAgo: 33,
    views: 198,
    likes: 9,
    pinned: false,
    content: [
      '# 我的 2026 开发工具清单',
      '',
      '工具是手的延伸，每年盘一次，留下的都是真用的。',
      '',
      '## 终端与编辑器',
      '',
      '- **ZCode**：日常开发主力，AI 结对编程体验极佳',
      '- **Windows Terminal + Git Bash**：够用就好',
      '- **VS Code**：偶尔改改远程配置',
      '',
      '## 效率三件套',
      '',
      '1. Everything —— 秒级全盘搜索',
      '2. uTools —— 剪贴板/截图/翻译一站式',
      '3. Docker Desktop —— 本地起 MySQL 比装服务省心',
      '',
      '> 佐证一句话：工具不在多，在于顺手。',
    ].join('\n'),
  },
]

const moments = [
  { content: '博客正式上线啦，之后的学习笔记和生活记录都会发布在这里 🎉', daysAgo: 30 },
  { content: '今天把首页的照片横幅换掉了，新的图看着心情很好，果然「家」的感觉最重要。', daysAgo: 24 },
  { content: '深夜调 CSS 网格布局，一个 minmax 解决了卡了一小时的问题。睡前记录一下。☕', daysAgo: 18 },
  { content: '咖啡馆漫游那天拍的照片洗出来了，色彩比想象中好看，下次继续。', daysAgo: 12, image: '/images/covers/coffee.jpg' },
  { content: '开始读《置身事内》，序言就很抓人，预计一周内读完写笔记。', daysAgo: 8 },
  { content: '把博客的 Dockerfile 瘦身了 6 倍，部署从 4 分钟缩短到 40 秒，爽！', daysAgo: 5 },
  { content: '最近在整理 CSS 速查手册，写到 grid-template-areas 的时候突然理解了「布局即代码」。', daysAgo: 2 },
  { content: '下周计划：写完 App Router 实践总结，然后开始学一点数据库索引调优。📚', daysAgo: 0 },
]

const friends = [
  { name: 'DIYgod', url: 'https://diygod.cc', description: '让信息流动起来' },
  { name: '云游君', url: 'https://yunyoujun.cn', description: '希望有一天能环游世界' },
  { name: 'HelloGitHub', url: 'https://hellogithub.com', description: '发现有趣的开源项目' },
  { name: '少数派', url: 'https://sspai.com', description: '高质量数字指南' },
  { name: 'Airing 的博客', url: 'https://airingursb.github.io', description: '一只热爱数学的程序员' },
  { name: 'Ivan 的小站', url: 'https://ivan.fun', description: '记录与分享' },
  { name: 'Austin', url: 'https://austin.dev', description: '前端工程师的日常' },
  { name: '漫步科技', url: 'https://wander.tech', description: '科技生活随笔' },
]

const comments = [
  { post: 'nextjs-app-router-notes', name: '阿杰', email: 'ajie@example.com', content: '写得很清楚，正好在迁移项目，收藏了！', daysAgo: 1 },
  { post: 'nextjs-app-router-notes', name: '小雨', email: 'xiaoyu@example.com', content: 'params 是 Promise 这个坑我也踩过 😂', daysAgo: 1, replyTo: 0 },
  { post: 'docker-node-deploy-pitfalls', name: 'Momo', email: 'momo@example.com', content: 'dockerignore 那个太真实了，第一次构建等了十分钟……', daysAgo: 3 },
  { post: 'cafe-weekend-walk', name: '老王', email: 'laowang@example.com', content: '这种不带电脑的周末太奢侈了，羡慕！', daysAgo: 4 },
  { post: 'book-notes-inside-china-economy', name: 'Chen', email: 'chen@example.com', content: '这本书也在我的待读列表里，看完笔记更想读了。', daysAgo: 6 },
]

const pvCurve = [24, 38, 31, 52, 46, 61, 55, 78, 69, 92, 84, 110, 96, 128]

async function main() {
  console.log('开始填充演示数据…')

  // 分类与标签
  const categoryMap = new Map()
  for (const cat of categories) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { description: cat.description },
      create: cat,
    })
    categoryMap.set(cat.name, row.id)
  }
  const tagMap = new Map()
  for (const name of tags) {
    const row = await prisma.tag.upsert({ where: { slug: name }, update: {}, create: { name, slug: name } })
    tagMap.set(name, row.id)
  }

  // 文章
  for (const post of posts) {
    const date = daysAgo(post.daysAgo)
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        contentMd: post.content,
        coverUrl: post.cover,
        status: 'published',
        isPinned: post.pinned,
        views: post.views,
        likes: post.likes,
        categoryId: categoryMap.get(post.category),
        publishedAt: date,
        createdAt: date,
        tags: { create: post.tags.map((t) => ({ tagId: tagMap.get(t) })) },
      },
    })
    await prisma.post.update({
      where: { slug: post.slug },
      data: {
        views: post.views,
        likes: post.likes,
        isPinned: post.pinned,
        tags: { deleteMany: {}, create: post.tags.map((t) => ({ tagId: tagMap.get(t) })) },
      },
    })
  }
  console.log(`文章：${posts.length} 篇（含封面图、浏览量、点赞）`)

  // 说说
  await prisma.moment.deleteMany({})
  await prisma.moment.createMany({
    data: moments.map((m) => ({
      content: m.content,
      imageUrl: m.image ?? '',
      createdAt: daysAgo(m.daysAgo, 20),
    })),
  })
  console.log(`说说：${moments.length} 条`)

  // 友链
  let friendCount = 0
  for (const friend of friends) {
    const exists = await prisma.friendLink.findFirst({ where: { url: friend.url } })
    if (!exists) {
      await prisma.friendLink.create({ data: friend })
      friendCount++
    }
  }
  console.log(`友链：新增 ${friendCount} 个（共 ${await prisma.friendLink.count()} 个）`)

  // 评论（首次运行时填充）
  const demoCommentMark = '写得很清楚，正好在迁移项目，收藏了！'
  const existsComment = await prisma.comment.findFirst({ where: { content: demoCommentMark } })
  if (!existsComment) {
    for (const c of comments) {
      const post = await prisma.post.findUnique({ where: { slug: c.post }, select: { id: true } })
      if (!post) continue
      const parent = c.replyTo !== undefined ? await prisma.comment.findFirst({ where: { content: comments[c.replyTo].content } }) : null
      await prisma.comment.create({
        data: {
          postId: post.id,
          parentId: parent?.id ?? null,
          authorName: c.name,
          authorEmail: c.email,
          content: c.content,
          status: 'approved',
          ip: '192.168.1.10',
          createdAt: daysAgo(c.daysAgo, 21),
        },
      })
    }
    console.log(`评论：${comments.length} 条（已通过审核）`)
  } else {
    console.log('评论：演示评论已存在，跳过')
  }

  // 最近 14 天每日 PV
  for (let i = 0; i < pvCurve.length; i++) {
    const date = (() => {
      const d = new Date()
      d.setDate(d.getDate() - (pvCurve.length - 1 - i))
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })()
    await prisma.dailyStat.upsert({
      where: { date },
      update: { pv: pvCurve[i] },
      create: { date, pv: pvCurve[i] },
    })
  }
  console.log(`每日 PV：最近 ${pvCurve.length} 天趋势已填充`)

  console.log('\n✅ 演示数据填充完成，去前台各页面看看效果吧！')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
