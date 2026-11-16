import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { createTag, parseTaxonomyInput, taxonomyErrorResponse } from '@/lib/taxonomy'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  try {
    const tag = await createTag(parseTaxonomyInput(body, false))
    return NextResponse.json({ ok: true, id: tag.id })
  } catch (err) {
    return taxonomyErrorResponse(err)
  }
}
