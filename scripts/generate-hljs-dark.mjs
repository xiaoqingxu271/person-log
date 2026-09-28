// 从 highlight.js 的 github-dark 主题生成 .dark 作用域的 CSS，
// 与浅色 github 主题共存：`.dark` 下的规则特异性更高，自动覆盖浅色 token。
// 运行：node scripts/generate-hljs-dark.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync('node_modules/highlight.js/styles/github-dark.css', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')

const out = []
const re = /([^{}]+)\{([^{}]*)\}/g
let m
while ((m = re.exec(src))) {
  const selectors = m[1].split(',').map((s) => s.trim()).filter(Boolean)
  const body = m[2].trim()
  if (selectors.length === 0 || !body) continue
  // 丢弃 .hljs 基础规则（背景/默认字色由 globals.css 控制），只保留 token 颜色
  if (selectors.length === 1 && selectors[0] === '.hljs') continue
  out.push(`${selectors.map((s) => `.dark ${s}`).join(',\n')} {\n  ${body}\n}`)
}

const banner =
  '/* 本文件由 scripts/generate-hljs-dark.mjs 生成，请勿手改；\n' +
  '   重新生成：node scripts/generate-hljs-dark.mjs */\n\n'

writeFileSync('src/app/hljs-dark.css', banner + out.join('\n\n') + '\n')
console.log(`生成 src/app/hljs-dark.css（${out.length} 条规则）`)
