// 初始化种子数据：管理员账号 + 示例文章（幂等，可重复执行）
// 运行：npm run db:seed
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123456'
  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash, displayName: '博主' },
  })
  console.log(`管理员账号就绪：${username} / ${password}（上线前请务必修改密码）`)

  await prisma.siteConfig.upsert({
    where: { key: 'github_url' },
    update: {},
    create: { key: 'github_url', value: 'https://github.com/xiaoqingxu271?tab=repositories' },
  })

  const category = await prisma.category.upsert({
    where: { slug: '随笔' },
    update: {},
    create: { name: '随笔', slug: '随笔', description: '日常记录与思考' },
  })
  const tag = await prisma.tag.upsert({
    where: { slug: '建站' },
    update: {},
    create: { name: '建站', slug: '建站' },
  })

  const demoContent = [
    '# 你好，person-log',
    '',
    '这是博客的第一篇文章。站点已经可以走通「写 → 发 → 看」的闭环：',
    '',
    '1. 登录后台 `/admin`',
    '2. 写一篇 Markdown 文章',
    '3. 发布后在前台就能看到',
    '',
    '## 代码高亮示例',
    '',
    '```ts',
    'export function greet(name: string) {',
    '  return `Hello, ${name}!`',
    '}',
    '```',
    '',
    '## 其他格式',
    '',
    '| 功能 | 状态 |',
    '| --- | --- |',
    '| 文章发布 | ✅ |',
    '| 代码高亮 | ✅ |',
    '',
    '> 支持 GFM 语法：表格、任务列表、删除线 ~~像这样~~。',
    '',
    '- [x] 搭好站点',
    '- [ ] 坚持写作',
  ].join('\n')

  await prisma.post.upsert({
    where: { slug: 'hello-person-log' },
    update: {},
    create: {
      title: 'Hello, person-log',
      slug: 'hello-person-log',
      summary: '博客的第一篇文章：站点搭建记录与写作计划。',
      contentMd: demoContent,
      status: 'published',
      publishedAt: new Date(),
      categoryId: category.id,
      tags: { create: [{ tagId: tag.id }] },
    },
  })
  console.log('示例文章就绪：/posts/hello-person-log')
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
