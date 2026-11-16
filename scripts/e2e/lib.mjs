// 端到端测试公共工具：服务器需先启动（npm run dev / npm run start）
import { createRequire } from 'node:module'

export const base = process.env.E2E_BASE ?? process.env.SMOKE_BASE ?? 'http://localhost:3000'
export const adminUsername = process.env.ADMIN_USERNAME ?? 'admin'
export const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123456'
export const suffix = Date.now().toString(36)

export const requireFromRepo = createRequire(new URL('../../package.json', import.meta.url))
export const { PrismaClient } = requireFromRepo('@prisma/client')

let cookie = ''

export function createChecker() {
  let passed = 0
  let failed = 0
  return {
    ok(name, cond, extra = '') {
      if (cond) {
        passed++
        console.log(`PASS ${name}`)
      } else {
        failed++
        console.log(`FAIL ${name}${extra ? ` :: ${extra}` : ''}`)
      }
    },
    summary() {
      console.log(`\n${passed} passed, ${failed} failed`)
      return failed === 0
    },
  }
}

export async function req(path, { method = 'GET', body, withCookie = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (withCookie && cookie) headers.Cookie = cookie
  const res = await fetch(base + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  })
  const setCookie = res.headers.getSetCookie?.() ?? []
  if (setCookie.length > 0) cookie = setCookie[0].split(';')[0]
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {}
  return { status: res.status, text, json, headers: res.headers }
}

export function login() {
  return req('/api/auth/login', {
    method: 'POST',
    body: { username: adminUsername, password: adminPassword },
  })
}
