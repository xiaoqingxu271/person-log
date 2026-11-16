// 从本地文件夹导入音乐，替换音乐库中的现有条目
// 运行：node scripts/import-music.mjs "D:/Software package/音乐合集"
// 说明：扫描目录下所有 .mp3，按「歌名 - 歌手.mp3」解析标题与艺术家，
//       复制到 data/uploads/audio/<yyyyMM>/ 并写入 music_item 表（先清空旧条目）。
import { readdir, mkdir, copyFile } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const SRC = process.argv[2] || 'D:/Software package/音乐合集'

function parseName(file) {
  const base = file.replace(/\.mp3$/i, '')
  const idx = base.lastIndexOf(' - ')
  if (idx === -1) return { title: base.trim(), artist: '未知艺术家' }
  return { title: base.slice(0, idx).trim(), artist: base.slice(idx + 3).trim() }
}

async function main() {
  const files = (await readdir(SRC)).filter((f) => /\.mp3$/i.test(f)).sort()
  if (files.length === 0) {
    console.error(`未在 ${SRC} 找到 .mp3 文件`)
    process.exitCode = 1
    return
  }

  const now = new Date()
  const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const dir = path.join(process.cwd(), 'data', 'uploads', 'audio', month)
  await mkdir(dir, { recursive: true })

  const rows = []
  for (const [i, file] of files.entries()) {
    const { title, artist } = parseName(file)
    const name = `${randomBytes(8).toString('hex')}.mp3`
    await copyFile(path.join(SRC, file), path.join(dir, name))
    rows.push({
      title,
      artist,
      coverUrl: '',
      audioUrl: `/api/uploads/audio/${month}/${name}`,
      genre: '流行',
      rating: 0,
      review: '',
      listenUrl: '',
      isVisible: true,
      createdAt: new Date(now.getTime() - i * 1000),
    })
    console.log(`复制 ${file} -> ${name}`)
  }

  const removed = await prisma.musicItem.deleteMany({})
  await prisma.musicItem.createMany({ data: rows })
  const total = await prisma.musicItem.count()
  console.log(`\n移除旧条目 ${removed.count} 条，导入 ${rows.length} 首，当前共 ${total} 首`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())