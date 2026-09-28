'use client'

import { useRef, useState } from 'react'

export function CodeBlock(props: React.HTMLAttributes<HTMLPreElement>) {
  const { children, ...rest } = props
  const ref = useRef<HTMLPreElement>(null)
  const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle')

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
    <div className="group relative">
      <pre ref={ref} {...rest}>
        {children}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
      >
        {state === 'done' ? '已复制' : state === 'fail' ? '复制失败' : '复制'}
      </button>
    </div>
  )
}
