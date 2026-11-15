/** 对称花饰分隔线（曲线 + 菱形星点），用于标签云/列表头尾装饰 */
export function Flourish({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 20"
      className={className}
      fill="none"
      aria-hidden
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <defs>
        <linearGradient id="fl-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#34d399" stopOpacity="0" />
          <stop offset="0.5" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <path d="M2 12c26 0 34-8 52-8 14 0 20 6 30 6" stroke="url(#fl-g)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M96 10l4-4 4 4-4 4Z" fill="#7dd3fc" />
      <circle cx="112" cy="10" r="1.5" fill="#c4b5fd" />
    </svg>
  )
}