// 安全响应头回归检查（需服务器运行）
import { createChecker, req } from './lib.mjs'

const { ok, summary } = createChecker()

const home = await req('/', { withCookie: false })
const csp = home.headers.get('content-security-policy') ?? ''
ok('CSP 已下发', csp.includes("default-src 'self'") && csp.includes("frame-ancestors 'none'"), csp)
ok('禁止 MIME 嗅探', home.headers.get('x-content-type-options') === 'nosniff')
ok('Referrer-Policy 已下发', Boolean(home.headers.get('referrer-policy')))
ok('X-Frame-Options 为 DENY', home.headers.get('x-frame-options') === 'DENY')
ok('Permissions-Policy 已下发', Boolean(home.headers.get('permissions-policy')))

const admin = await req('/admin/login', { withCookie: false })
ok(
  '后台禁止搜索引擎索引',
  (admin.headers.get('x-robots-tag') ?? '').includes('noindex'),
  admin.headers.get('x-robots-tag') ?? '',
)

const unsub = await req('/unsubscribe', { withCookie: false })
ok(
  '退订页禁止搜索引擎索引',
  (unsub.headers.get('x-robots-tag') ?? '').includes('noindex'),
  unsub.headers.get('x-robots-tag') ?? '',
)

const confirmPage = await req('/subscribe/confirm', { withCookie: false })
ok(
  '订阅确认页禁止搜索引擎索引',
  (confirmPage.headers.get('x-robots-tag') ?? '').includes('noindex'),
  confirmPage.headers.get('x-robots-tag') ?? '',
)

process.exit(summary() ? 0 : 1)
