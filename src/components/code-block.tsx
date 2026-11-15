'use client'

import { isValidElement, useRef, useState } from 'react'

function languageOf(children: React.ReactNode): string {
  if (isValidElement(children)) {
    const cls = (children.props as { className?: string }).className ?? ''
    const match = /language-([\w-]+)/.exec(cls)
    if (match) return match[1]
  }
  return 'code'
}

/** 代码块：mac 圆点 + 语言标签头部 + 复制按钮（极光暗色） */
export function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  const { children, ...rest } = props
  const ref = useRef<HTMLPreElement>(null)
  const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle')
  const lang = languageOf(children)

  async function handleCopy() {
    const text = ref.current?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setState('done')
    } catch {
      setState('fail')
    }
    setTimeout(() => setState('idle'), 1500)
  }

  return (
    <div className="not-prose group overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-[0_10px_30px_rgba(2,6,23,0.45)]">
      <div className="flex items-center gap-2 border-b border-white/8 bg-white/4 px-4 py-2.5">
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="glass-chip ml-2 rounded-md px-2.5 py-0.5 font-mono text-[11px] text-slate-400">
          {lang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="ml-auto rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-ice-300"
        >
          {state === 'done' ? '已复制' : state === 'fail' ? '复制失败' : '复制'}
        </button>
      </div>
      <pre ref={ref} {...rest} className="!m-0 !rounded-none !border-0 overflow-x-auto p-4 text-[13px] leading-relaxed">
        {children}
      </pre>
    </div>
  )
}