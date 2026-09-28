import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { saveSiteConfig, type SiteConfigValues } from '@/lib/site-config'

const ALLOWED_FIELDS: (keyof SiteConfigValues)[] = [
  'siteName',
  'tagline',
  'description',
  'footerText',
  'githubUrl',
  'email',
  'bannerUrl',
  'commentBannedWords',
  'commentAutoApproveEmails',
]

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '无效的请求体' }, { status: 400 })
  }

  const values: Partial<Record<keyof SiteConfigValues, string>> = {}
  for (const field of ALLOWED_FIELDS) {
    const value = body[field]
    if (typeof value === 'string') values[field] = value.slice(0, 500)
  }

  try {
    await saveSiteConfig(values)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('保存站点设置失败:', err)
    return NextResponse.json({ error: '保存失败，请重试' }, { status: 500 })
  }
}
