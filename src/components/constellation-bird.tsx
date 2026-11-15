/** 星座连线风格的几何飞鸟（极光之语装饰） */
export function ConstellationBird({ className }: { className?: string }) {
  const lines: [number, number, number, number][] = [
    [4, 50, 20, 42], [20, 42, 34, 48], [34, 48, 48, 60], [20, 42, 40, 72], [40, 72, 48, 60],
    [34, 48, 56, 8], [56, 8, 66, 32], [66, 32, 48, 60], [56, 8, 48, 60],
    [66, 32, 72, 44], [72, 44, 62, 52], [62, 52, 48, 60],
    [62, 52, 88, 56], [88, 56, 96, 38], [96, 38, 98, 68], [98, 68, 88, 56], [88, 56, 48, 60],
    [40, 72, 44, 80], [44, 80, 26, 98], [26, 98, 40, 72], [44, 80, 48, 60],
  ]
  const nodes: [number, number][] = [
    [4, 50], [20, 42], [34, 48], [48, 60], [40, 72], [56, 8], [66, 32],
    [72, 44], [62, 52], [88, 56], [96, 38], [98, 68], [44, 80], [26, 98],
  ]
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      style={{ filter: 'drop-shadow(0 0 7px rgba(167,139,250,0.55))' }}
      aria-hidden
    >
      <defs>
        <linearGradient id="bird-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.55" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#e879f9" />
        </linearGradient>
      </defs>
      <g stroke="url(#bird-g)" strokeWidth="1" opacity="0.85">
        {lines.map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 2.2 : 1.6} fill={i % 4 === 0 ? '#e0f2fe' : '#c4b5fd'} />
      ))}
    </svg>
  )
}