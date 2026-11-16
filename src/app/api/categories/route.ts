import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { createCategory, parseTaxonomyInput, taxonomyErrorResponse } from '@/lib/taxonomy'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: '未登录' }, { status: 401 })
  }
  const body = await req.json().catch(() => null)
  try {
    const category = await createCategory(parseTaxonomyInput(body, true))
    return NextResponse.json({ ok: true, id: category.id })
  } catch (err) {
    return taxonomyErrorResponse(err)
  }
}
