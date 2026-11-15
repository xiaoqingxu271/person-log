/** 散点星座装饰（说说页右栏底部） */
export function StarConstellation({ className }: { className?: string }) {
  const dots: [number, number, number][] = [
    [10, 20, 1.6], [40, 8, 1.2], [70, 26, 1.8], [104, 12, 1.3], [130, 34, 1.6],
    [22, 52, 1.2], [58, 60, 1.5], [92, 48, 1.2], [122, 66, 1.7], [148, 54, 1.2],
  ]
  const lines: [number, number, number, number][] = [
    [10, 20, 40, 8], [40, 8, 70, 26], [70, 26, 104, 12], [104, 12, 130, 34],
    [22, 52, 58, 60], [58, 60, 92, 48], [92, 48, 122, 66], [70, 26, 92, 48],
  ]
  return (
    <svg viewBox="0 0 160 80" className={className} fill="none" aria-hidden>
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(186,230,253,0.35)" strokeWidth="1" />
      ))}
      {dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? '#bae6fd' : i % 3 === 1 ? '#c4b5fd' : '#f0abfc'} />
      ))}
      <path d="M30 70h22M84 74h18M112 20h16" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}