import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat, open } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
}

interface Ctx {
  params: Promise<{ path: string[] }>
}

/** 提供上传文件的静态访问：/api/uploads/<yyyyMM>/<file>，音频支持 Range 请求（进度拖动） */
export async function GET(req: NextRequest, ctx: Ctx) {
  const { path: segments } = await ctx.params
  if (
    !segments ||
    segments.length === 0 ||
    segments.some((s) => !s || s.includes('..') || s.includes('/') || s.includes('\\'))
  ) {
    return NextResponse.json({ error: '无效路径' }, { status: 400 })
  }

  const root = path.resolve(process.cwd(), 'data', 'uploads')
  const full = path.resolve(root, ...segments)
  if (!full.startsWith(root + path.sep)) {
    return NextResponse.json({ error: '无效路径' }, { status: 400 })
  }

  const mime = MIME_BY_EXT[path.extname(full).toLowerCase()]
  if (!mime) {
    return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
  }

  try {
    const size = (await stat(full)).size
    const cache = 'public, max-age=31536000, immutable'
    const range = req.headers.get('range')

    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
      let start = match && match[1] ? Number(match[1]) : NaN
      let end = match && match[2] ? Number(match[2]) : NaN
      if (Number.isNaN(start) && !Number.isNaN(end)) {
        // suffix range: bytes=-N（最后 N 字节）
        start = Math.max(0, size - end)
        end = size - 1
      } else {
        if (Number.isNaN(start)) start = 0
        if (Number.isNaN(end) || end >= size) end = size - 1
      }
      if (start >= size || start > end || start < 0) {
        return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } })
      }
      const length = end - start + 1
      const fh = await open(full, 'r')
      try {
        const buf = Buffer.alloc(length)
        await fh.read(buf, 0, length, start)
        return new Response(new Uint8Array(buf), {
          status: 206,
          headers: {
            'Content-Type': mime,
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Content-Length': String(length),
            'Accept-Ranges': 'bytes',
            'Cache-Control': cache,
          },
        })
      } finally {
        await fh.close()
      }
    }

    const buf = await readFile(full)
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': mime,
        'Content-Length': String(size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': cache,
      },
    })
  } catch {
    return NextResponse.json({ error: '文件不存在' }, { status: 404 })
  }
}