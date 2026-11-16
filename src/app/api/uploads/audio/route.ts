import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { randomBytes } from 'crypto'
import { getSessionUser } from '@/lib/session'

export const runtime = 'nodejs'

const MAX_SIZE = 30 * 1024 * 1024
const EXT_BY_MIME: Record<string, string> = {
  'audio/mpeg': '.mp3',
  'audio/mp3': '.mp3',
  'audio/wav': '.wav',
  'audio/x-wav': '.wav',
  'audio/wave': '.wav',
  'audio/ogg': '.ogg',
  'audio/mp4': '.m4a',
  'audio/x-m4a': '.m4a',
  'audio/flac': '.flac',
  'audio/aac': '.aac',
}

/** 上传音频到本地 data/uploads/audio/<yyyyMM>/，返回可访问 URL（支持 Range 播放） */
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
    return NextResponse.json({ error: '仅支持 MP3/WAV/OGG/M4A/FLAC/AAC 音频' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '音频不能超过 30MB' }, { status: 400 })
  }

  const now = new Date()
  const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const name = `${randomBytes(8).toString('hex')}${ext}`
  const dir = path.join(process.cwd(), 'data', 'uploads', 'audio', month)

  await mkdir(dir, { recursive: true })
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()))

  return NextResponse.json({ url: `/api/uploads/audio/${month}/${name}` })
}