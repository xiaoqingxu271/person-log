// 上传文件孤儿清理：扫描 data/uploads，对比数据库与 about.md 中的 /api/uploads 引用
// 用法：node scripts/cleanup-uploads.mjs [--delete] [--dir=path] [--min-age-hours=24]
import { readdir, stat, unlink, readFile } from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'

const args = process.argv.slice(2)
const shouldDelete = args.includes('--delete')

function option(name, fallback) {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const dir = path.resolve(option('dir', 'data/uploads'))
const minAgeHours = Number(option('min-age-hours', '24'))
if (!Number.isFinite(minAgeHours) || minAgeHours < 0) {
  console.error('--min-age-hours 必须是非负数字')
  process.exit(1)
}

const requireFromRepo = createRequire(new URL('../package.json', import.meta.url))
const { PrismaClient } = requireFromRepo('@prisma/client')
const prisma = new PrismaClient()

async function walk(root, prefix = '') {
  const entries = await readdir(path.join(root, prefix), { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory()) files.push(...(await walk(root, rel)))
    else if (entry.isFile()) files.push(rel)
  }
  return files
}

const referenced = new Set()

function collect(value) {
  if (typeof value !== 'string') return
  for (const match of value.matchAll(/\/api\/uploads\/[^\s"'()<>\\]+/g)) {
    const rel = decodeURIComponent(match[0].slice('/api/uploads/'.length)).replace(/[?#].*$/, '')
    if (rel) referenced.add(rel)
  }
}

const [posts, users, moments, music, photos, friends, settings] = await Promise.all([
  prisma.post.findMany({ select: { coverUrl: true, contentMd: true } }),
  prisma.user.findMany({ select: { avatarUrl: true } }),
  prisma.moment.findMany({ select: { imageUrl: true, content: true } }),
  prisma.musicItem.findMany({ select: { coverUrl: true, audioUrl: true } }),
  prisma.photo.findMany({ select: { imageUrl: true } }),
  prisma.friendLink.findMany({ select: { avatar: true } }),
  prisma.siteConfig.findMany(),
])
for (const post of posts) {
  collect(post.coverUrl)
  collect(post.contentMd)
}
for (const user of users) collect(user.avatarUrl)
for (const moment of moments) {
  collect(moment.imageUrl)
  collect(moment.content)
}
for (const item of music) {
  collect(item.coverUrl)
  collect(item.audioUrl)
}
for (const photo of photos) collect(photo.imageUrl)
for (const friend of friends) collect(friend.avatar)
for (const setting of settings) collect(setting.value)
try {
  collect(await readFile(path.resolve('content/about.md'), 'utf8'))
} catch {
  // 关于页不是必需文件
}
await prisma.$disconnect()

const files = await walk(dir)
const now = Date.now()
const orphans = []
for (const file of files) {
  if (referenced.has(file)) continue
  const info = await stat(path.join(dir, file))
  orphans.push({ file, size: info.size, ageHours: (now - info.mtimeMs) / 3_600_000 })
}

const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2)
const orphanBytes = orphans.reduce((sum, item) => sum + item.size, 0)

console.log(`扫描目录：${dir}`)
console.log(`文件总数：${files.length}，数据库引用：${referenced.size}，孤儿文件：${orphans.length}（${mb(orphanBytes)} MB）`)
for (const item of orphans.slice(0, 100)) {
  console.log(`  - ${item.file}  ${mb(item.size)} MB  ${item.ageHours.toFixed(1)}h 前`)
}
if (orphans.length > 100) console.log(`  … 其余 ${orphans.length - 100} 个省略`)

if (!shouldDelete) {
  console.log('\n预览模式，未删除任何文件。确认无误后加 --delete 执行删除。')
  process.exit(0)
}

let deleted = 0
let deletedBytes = 0
let skipped = 0
for (const item of orphans) {
  if (item.ageHours < minAgeHours) {
    skipped++
    continue
  }
  await unlink(path.join(dir, item.file))
  deleted++
  deletedBytes += item.size
  console.log(`已删除 ${item.file}`)
}
console.log(`\n删除完成：${deleted} 个（${mb(deletedBytes)} MB），跳过近期文件 ${skipped} 个（少于 ${minAgeHours} 小时）。`)
