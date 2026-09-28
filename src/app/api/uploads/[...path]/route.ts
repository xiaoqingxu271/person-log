import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

interface Ctx {
  params: Promise<{ path: string[] }>
}

/** 提供上传图片的静态访问：/api/uploads/<yyyyMM>/<file> */
export async function GET(_req: NextRequest, ctx: Ctx) {
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
    const buf = await readFile(full)
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return NextResponse.json({ error: '图片不存在' }, { status: 404 })
  }
}
