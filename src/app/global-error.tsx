'use client'

import Link from 'next/link'
import { errorDigest } from '@/lib/error-digest'

export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = errorDigest(error)

  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070b17',
          color: '#cbd5e1',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        }}
      >
        <title>页面出了点问题</title>
        <div
          style={{
            maxWidth: 420,
            margin: '0 16px',
            padding: '40px 32px',
            textAlign: 'center',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(15,23,42,0.72)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 24, color: '#fff' }}>页面出了点问题</h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.7, color: '#94a3b8' }}>
            站点暂时无法加载，请稍后重试。
          </p>
          {digest ? (
            <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>
              错误编号：{digest}
            </p>
          ) : null}
          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                cursor: 'pointer',
                border: 0,
                borderRadius: 999,
                padding: '10px 22px',
                fontSize: 14,
                color: '#0b1020',
                background: 'linear-gradient(120deg,#7dd3fc,#a78bfa)',
              }}
            >
              重试
            </button>
            <Link
              href="/"
              style={{
                borderRadius: 999,
                padding: '10px 22px',
                fontSize: 14,
                color: '#cbd5e1',
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              返回首页
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
