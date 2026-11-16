import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { adminListConfirmedSubscribers } from '@/lib/subscribers'
import { SITE } from '@/lib/site'

export const runtime = 'nodejs'

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

/** 导出已确认订阅列表 CSV（含退订链接，方便人工群发时附带） */
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const subscribers = await adminListConfirmedSubscribers()
  const lines = [
    ['email', 'subscribed_at', 'unsubscribe_url'].map(csvCell).join(','),
    ...subscribers.map((item) =>
      [
        item.email,
        item.createdAt.toISOString(),
        item.token ? `${SITE.url}/unsubscribe?token=${encodeURIComponent(item.token)}` : '',
      ]
        .map(csvCell)
        .join(','),
    ),
  ]

  const date = new Date().toISOString().slice(0, 10)
  return new Response(`\uFEFF${lines.join('\r\n')}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${date}.csv"`,
    },
  })
}
