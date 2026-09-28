import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { getSessionUser } from '@/lib/session'

export const runtime = 'nodejs'

const MAX_SIZE = 10 * 1024 * 1024
const EXT_BY_MIME: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/avif': '.avif',
}

/** 上传图片到本地 data/uploads/<yyyyMM>/，返回可访问的 URL（暂不支持 svg，防 XSS） */
export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const form = await req.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '缺少文件' }, { status: 400 })
  }
  const ext = EXT_BY_MIME[file.type]
  if (!ext) {
    return NextResponse.json({ error: '仅支持 PNG/JPG/GIF/WebP/AVIF 图片' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '图片不能超过 10MB' }, { status: 400 })
  }

  const now = new Date()
  const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const name = `${randomBytes(8).toString('hex')}${ext}`
  const dir = path.join(process.cwd(), 'data', 'uploads', month)

  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/api/uploads/${month}/${name}` })
}
