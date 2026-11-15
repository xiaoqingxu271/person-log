// 极光主题演示数据（幂等，可重复执行）
// 运行：node scripts/demo-aurora.mjs
// 说明：按 slug/url 去重创建文章、分类、标签、说说、友链；
//       会重建 daily_stat 近一年的演示访问曲线；仅当头像为空时设置博主头像。
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const POSTS = [
  {
    slug: 'react-18-concurrent-suspense',
    title: 'React 18 新特性完全指南：Concurrent Mode 与 Suspense',
    summary: '探索 React 18 的并发特性，包括 Concurrent Mode、Suspense、Server Components 等，带你深入理解其原理与最佳实践。',
    cover: '/images/covers/aurora.jpg',
    category: '前端开发',
    tags: ['React', 'Hooks'],
    views: 1284,
    likes: 86,
    daysAgo: 5,
    content: `# React 18 新特性完全指南

React 18 最大的变化不是某个新 API，而是底层渲染模型升级到了**并发渲染（Concurrent Rendering）**。渲染可以被中断、恢复、甚至丢弃，浏览器因此能在长任务中保持响应。

## 并发渲染解决了什么

过去一次 setState 触发的渲染是同步且不可中断的，大组件树更新会阻塞主线程。并发模式下，React 把渲染切成小片，利用空闲时间推进：

- 高优先级更新（输入、点击）立即响应
- 低优先级更新（列表过滤、图表重绘）可被打断
- 过渡更新不会让旧 UI 闪烁

## useTransition：把更新标记为过渡

\`\`\`tsx
const [isPending, startTransition] = useTransition()

function onChange(e) {
  const value = e.target.value
  setInput(value)              // 紧急：输入框立即更新
  startTransition(() => {
    setQuery(value)            // 过渡：结果列表可以慢一点
  })
}
\`\`\`

\`isPending\` 为 true 时可以展示一个不阻塞输入的加载态。

## Suspense 与数据获取

Suspense 让「等待数据」成为声明式的一部分：

\`\`\`tsx
<Suspense fallback={<Skeleton />}>
  <Comments postId={id} />
</Suspense>
\`\`\`

配合支持 Suspense 的数据源（如 RSC、Relay、SWR 的 suspense 模式），加载态与错误边界可以按区域精细拆分。

## 自动批处理

React 18 中，Promise、setTimeout、原生事件回调里的多次 setState 也会被合并为一次渲染，减少了不必要的重绘。

## 迁移建议

1. 用 \`createRoot\` 替换 \`ReactDOM.render\`，开启并发能力
2. 把搜索、过滤等重交互包进 \`startTransition\`
3. 用 Suspense 边界替换手写的 \`isLoading\` 分支
4. 严格模式下留意副作用的重复执行，确保幂等

> 并发不是「更快」，而是「更跟手」。把优先级交还给用户，是 React 18 的设计哲学。
`,
  },
  {
    slug: 'we-are-stardust',
    title: '在宇宙的尺度下，我们都是星尘',
    summary: '从宇宙的演化到生命的诞生，我们都是星尘的一部分。探索宇宙的奥秘，思考人类的未来与意义。',
    cover: '/images/covers/cosmos.jpg',
    category: '天文',
    tags: ['宇宙', '随笔'],
    views: 892,
    likes: 64,
    daysAgo: 9,
    content: `# 在宇宙的尺度下，我们都是星尘

你身体里的每一个碳原子，都诞生于某颗恒星的内核；每一次心跳里的铁，都来自一场超新星爆发的余烬。我们不是宇宙的旁观者，而是宇宙演化出的、能够回望自身的物质。

## 一条 138 亿年的链条

- **大爆炸后 3 分钟**：氢与氦的原初核合成
- **第一代恒星**：在引力中点燃，锻造出碳、氧、铁
- **超新星爆发**：把重元素抛洒进星际空间
- **太阳与地球**：在上一代恒星的残骸中凝聚
- **生命**：用这些星尘，写出会思考的分子

## 尺度带来的谦卑

可观测宇宙的直径约 930 亿光年，而地球不过是一粒悬浮在阳光中的微尘。但正是这粒微尘上，诞生了能测量宇宙年龄、能预测彗星回归的意识。

> 宇宙不仅比我们想象的更奇怪，而且比我们能够想象的更奇怪。—— 霍尔丹

## 为什么还要仰望

仰望星空不会让房贷消失，但它提醒我们：眼前的得失，放在光年的尺度上轻如尘埃；而好奇心与爱，却是宇宙中已知最罕见的现象。

愿我们都能偶尔抬头，认出自己身上的星光。
`,
  },
  {
    slug: 'norway-aurora-seven-days',
    title: '挪威之旅：追寻极光的七日',
    summary: '记录在挪威的七天自驾之旅，从奥斯陆到特罗姆瑟，追逐极光，体验北欧的自然与人文。',
    cover: '/images/covers/mountain.jpg',
    category: '旅行',
    tags: ['旅行', '摄影', '挪威'],
    views: 756,
    likes: 52,
    daysAgo: 13,
    content: `# 挪威之旅：追寻极光的七日

为了一个在夜空里跳舞的绿色梦，我把年假攒到了冬天，飞向了北纬 69 度的特罗姆瑟。

## 行程一览

| 天数 | 地点 | 关键词 |
| --- | --- | --- |
| D1 | 奥斯陆 | 歌剧院、蒙克博物馆 |
| D2 | 奥斯陆 → 博德 | 内陆航班、峡湾初印象 |
| D3 | 博德 → 特罗姆瑟 | 沿海自驾、驯鹿雪原 |
| D4 | 特罗姆瑟 | 极光教堂、北极大教堂 |
| D5 | 林根阿尔卑斯 | 雪山徒步、第一晚极光 |
| D6 | 塞尼亚岛 | 渔村、鲸鱼观测 |
| D7 | 特罗姆瑟 → 返程 | 极地博物馆、告别 |

## 极光初遇

D5 夜里 KP 指数冲到 5。我们把车停在结冰的湖边，关掉所有灯。起初只是一抹淡淡的灰绿，像云；十分钟后，整条光带突然亮起来，从山脊后翻卷而上，边缘泛着紫红。

那一刻没有人说话，只有快门声。

## 实用建议

- **时间**：11 月至次年 2 月，黑夜足够长
- **天气**：晴天比 KP 指数更重要，追云图比追极光图有用
- **器材**：广角大光圈镜头 + 三脚架，手动对焦到无穷远
- **保暖**：电池在低温下掉电极快，备用电池贴身放

> 极光不会为谁停留，但等待本身，就是旅行的一部分。
`,
  },
  {
    slug: 'nextjs-16-digital-garden',
    title: '用 Next.js 16 搭建自己的数字花园',
    summary: '从选型到部署，用 Next.js 16 + Prisma 搭一个会生长的个人博客，记录完整的工程决策。',
    cover: '/images/aurora-lake.jpg',
    category: '前端开发',
    tags: ['Next.js', '建站'],
    views: 634,
    likes: 41,
    daysAgo: 19,
    content: `# 用 Next.js 16 搭建自己的数字花园

博客不该是一次性的装修，而是一座会生长的花园。这一篇记录我用 Next.js 16 重建个人站点的工程决策。

## 技术栈

- **框架**：Next.js 16（App Router + Server Components）
- **数据**：MySQL + Prisma，类型安全直达组件
- **样式**：Tailwind CSS 4，设计令牌集中在 \`@theme\`
- **内容**：Markdown + remark/rehype，代码高亮与消毒一应俱全

## 数据直达组件

Server Component 里直接查库，省掉一层 API：

\`\`\`tsx
export default async function Page() {
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
  })
  return <PostList posts={posts} />
}
\`\`\`

## 图片与字体

- \`next/image\` 自动 AVIF/WebP，封面懒加载
- \`next/font\` 自托管字体，零外部请求、零布局偏移

## 部署

容器化输出 \`standalone\`，一条 \`docker compose up\` 即可上线；RSS、sitemap、JSON-LD 让搜索引擎与订阅器都能找到这里。

> 数字花园的意义在于持续生长：先种下第一篇，剩下的交给时间。
`,
  },
  {
    slug: 'aurora-photography-basics',
    title: '极光摄影入门：参数、时机与构图',
    summary: '拍好极光不需要昂贵的器材：掌握曝光三要素、KP 指数与构图法则，手机也能出片。',
    cover: '/images/aurora-cabin.jpg',
    category: '旅行',
    tags: ['摄影', '极光'],
    views: 588,
    likes: 37,
    daysAgo: 25,
    content: `# 极光摄影入门：参数、时机与构图

极光摄影的门槛比想象中低。一台能手动曝光的相机、一个三脚架、一片晴朗的夜空，就够了。

## 曝光三要素

| 参数 | 推荐范围 | 说明 |
| --- | --- | --- |
| 光圈 | f/1.4 – f/2.8 | 越大越好，进光量决定画质 |
| 快门 | 2s – 15s | 极光移动快时缩短，避免糊成一片 |
| ISO | 800 – 3200 | 在亮度与噪点间取舍 |

## 时机：先看云，再看 KP

- **KP 指数**：≥ 3 值得出门，≥ 5 可能爆发
- **云量**：晴天是硬条件，学会看卫星云图
- **月相**：新月前后夜空更暗，极光对比更强
- **时段**：当地 22 点至凌晨 2 点概率最高

## 构图：给极光一个前景

纯天空的极光照片容易单调。找一座山、一间亮灯的小屋、一片结冰的湖作为前景，画面立刻有了故事与尺度。

## 手机也能拍

现代手机的夜景模式长曝光已能记录极光：固定手机、开启夜景、避免手抖，同样能出片。

> 参数只是起点，真正决定照片的，是你愿意在寒夜里等多久。
`,
  },
]

const MOMENTS = [
  {
    content: '今晚极光指数 KP=5，蹲一个晴天，希望能在湖边等到爆发 🌌',
    daysAgo: 2,
    imageUrl: '/images/aurora-cabin.jpg',
    likes: 156,
  },
  {
    content: '把博客换上了极光主题，夜里写代码都变得浪漫了 ✨',
    daysAgo: 0,
    imageUrl: '/images/aurora-lake.jpg',
    likes: 128,
  },
  {
    content: '一本书，一杯咖啡，一个安静的下午。📖',
    daysAgo: 0.2,
    imageUrl: '/images/covers/cosmos.jpg',
    likes: 86,
  },
  {
    content: '星空不会忘记每一个仰望它的人。🌠',
    daysAgo: 1,
    imageUrl: '/images/covers/mountain.jpg',
    likes: 203,
  },
]

const FRIENDS = [
  { name: 'Next.js 官方文档', url: 'https://nextjs.org/docs', description: 'App Router 与 Server Components 的权威指南', avatar: '/images/covers/aurora.jpg' },
  { name: 'React 中文文档', url: 'https://zh-hans.react.dev', description: '新版 React 官方中文教程', avatar: '/images/covers/cosmos.jpg' },
  { name: 'LittleSky', url: 'https://example.com/littlesky', description: '记录生活与技术的点滴，在数字世界里寻找诗意。', avatar: '/images/aurora-lake.jpg' },
  { name: 'Code & Coffee', url: 'https://example.com/code-coffee', description: '代码不止于逻辑，还有咖啡与浪漫。', avatar: '/images/covers/mountain.jpg' },
  { name: 'Aurora Notes', url: 'https://example.com/aurora-notes', description: '思考 · 记录 · 分享，做一个有温度的技术人。', avatar: '/images/aurora-cabin.jpg' },
  { name: 'Mountain Soul', url: 'https://example.com/mountain-soul', description: '山高路远，但总有志同道合的人。', avatar: '/images/covers/aurora.jpg' },
  { name: 'Forest Blog', url: 'https://example.com/forest-blog', description: '热爱自然，热爱技术，热爱生活的一切可能。', avatar: '/images/aurora-lake.jpg' },
  { name: 'Cosmos Studio', url: 'https://example.com/cosmos-studio', description: '探索技术的宇宙，也追寻内心的星辰。', avatar: '/images/covers/cosmos.jpg' },
  { name: 'Wave Log', url: 'https://example.com/wave-log', description: '像海浪一样前进，记录每一次起伏与成长。', avatar: '/images/covers/mountain.jpg' },
  { name: 'Purple Peak', url: 'https://example.com/purple-peak', description: '安静的表达，也能抵达很远的地方。', avatar: '/images/aurora-cabin.jpg' },
]

const CATEGORY_DESC = {
  前端开发: '探索 Web 技术的无限可能，记录前端开发的点滴与进阶之路。',
  天文: '仰望星空，探索宇宙的奥秘，记录那些震撼人心的瞬间。',
  旅行: '用镜头记录世界的美好，每一次出发都是新的遇见。',
  随笔: '记录生活中的小确幸与思考，平凡的日子也有闪闪发光的瞬间。',
}

function daysAgoDate(n) {
  if (!Number.isInteger(n)) return new Date(Date.now() - n * 86400000)
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(20, 0, 0, 0)
  return d
}

async function main() {
  // 分类与标签
  const categoryNames = [...new Set(POSTS.map((p) => p.category))]
  const categories = {}
  for (const name of categoryNames) {
    categories[name] = await prisma.category.upsert({
      where: { slug: name },
      update: { description: CATEGORY_DESC[name] ?? '' },
      create: { name, slug: name, description: CATEGORY_DESC[name] ?? '' },
    })
  }
  const tagNames = [...new Set(POSTS.flatMap((p) => p.tags))]
  const tags = {}
  for (const name of tagNames) {
    tags[name] = await prisma.tag.upsert({ where: { slug: name }, update: {}, create: { name, slug: name } })
  }

  // 文章（按 slug 幂等）
  for (const p of POSTS) {
    const exists = await prisma.post.findUnique({ where: { slug: p.slug } })
    if (exists) {
      console.log(`跳过已存在文章：${p.title}`)
      continue
    }
    await prisma.post.create({
      data: {
        title: p.title,
        slug: p.slug,
        summary: p.summary,
        contentMd: p.content,
        coverUrl: p.cover,
        status: 'published',
        views: p.views,
        likes: p.likes,
        publishedAt: daysAgoDate(p.daysAgo),
        categoryId: categories[p.category].id,
        tags: { create: p.tags.map((t) => ({ tagId: tags[t].id })) },
      },
    })
    console.log(`创建文章：${p.title}`)
  }

  // 近一年访问曲线（演示数据，重建）
  const rows = []
  for (let i = 364; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const growth = 140 + (364 - i) * 2.1
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 0.72 : 1
    const noise = 0.78 + 0.44 * (Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1)
    const spike = i % 29 === 0 ? 1.5 : 1
    rows.push({ date, pv: Math.round(growth * weekend * noise * spike) })
  }
  await prisma.$transaction(
    rows.map((r) =>
      prisma.dailyStat.upsert({ where: { date: r.date }, update: { pv: r.pv }, create: r }),
    ),
  )
  console.log(`重建近一年访问曲线：${rows.length} 天`)

  // 说说（按内容去重；已存在则补齐配图与点赞）
  for (const m of MOMENTS) {
    const exists = await prisma.moment.findFirst({ where: { content: m.content } })
    if (!exists) {
      await prisma.moment.create({
        data: {
          content: m.content,
          imageUrl: m.imageUrl ?? '',
          likes: m.likes ?? 0,
          createdAt: daysAgoDate(m.daysAgo),
        },
      })
      console.log(`创建说说：${m.content}`)
    } else {
      await prisma.moment.update({
        where: { id: exists.id },
        data: { imageUrl: m.imageUrl ?? exists.imageUrl, likes: m.likes ?? exists.likes },
      })
    }
  }

  // 友链（按 url 去重；已存在则补齐头像）
  for (const f of FRIENDS) {
    const exists = await prisma.friendLink.findFirst({ where: { url: f.url } })
    if (!exists) {
      await prisma.friendLink.create({ data: f })
      console.log(`创建友链：${f.name}`)
    } else if (!exists.avatar && f.avatar) {
      await prisma.friendLink.update({ where: { id: exists.id }, data: { avatar: f.avatar } })
    }
  }

  // 站点描述（对齐极光主题文案）
  await prisma.siteConfig.upsert({
    where: { key: 'site_description' },
    update: { value: '记录思考，探索技术，分享生活。' },
    create: { key: 'site_description', value: '记录思考，探索技术，分享生活。' },
  })

  // 博主头像（仅当为空时设置）
  await prisma.user.updateMany({
    where: { avatarUrl: '' },
    data: { avatarUrl: '/images/avatar.jpg' },
  })

  console.log('极光演示数据就绪 ✔')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())