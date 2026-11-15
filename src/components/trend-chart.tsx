'use client'

import { useId, useMemo, useState } from 'react'
import { formatCount } from '@/lib/format'

export interface PvPoint {
  date: string
  pv: number
}

type Range = '7d' | '30d' | '1y'

const TABS: { key: Range; label: string }[] = [
  { key: '7d', label: '近7天' },
  { key: '30d', label: '近30天' },
  { key: '1y', label: '近1年' },
]

const W = 320
const H = 160
const PAD = { l: 34, r: 12, t: 12, b: 24 }
const PLOT_W = W - PAD.l - PAD.r
const PLOT_H = H - PAD.t - PAD.b

function niceStep(raw: number): number {
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  const candidate = [1, 1.5, 2, 3, 5, 10].find((c) => n <= c) ?? 10
  return candidate * pow
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`
  const clampY = (y: number) => Math.min(PAD.t + PLOT_H, Math.max(PAD.t, y))
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = clampY(p1.y + (p2.y - p0.y) / 6)
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = clampY(p2.y - (p3.y - p1.y) / 6)
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

/** 访问趋势折线图：近7天 / 近30天 / 近1年（按月聚合），悬停查看数值 */
export function TrendChart({ series }: { series: PvPoint[] }) {
  const [range, setRange] = useState<Range>('7d')
  const [hover, setHover] = useState<number | null>(null)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')

  const points = useMemo(() => {
    if (range === '1y') {
      const byMonth = new Map<string, number>()
      for (const p of series) {
        const key = p.date.slice(0, 7)
        byMonth.set(key, (byMonth.get(key) ?? 0) + p.pv)
      }
      return [...byMonth.entries()].map(([month, pv]) => ({
        label: `${Number(month.slice(5))}月`,
        full: month,
        pv,
      }))
    }
    const days = range === '7d' ? 7 : 30
    return series.slice(-days).map((p) => ({ label: p.date.slice(5), full: p.date, pv: p.pv }))
  }, [series, range])

  const max = Math.max(1, ...points.map((p) => p.pv))
  const step = niceStep(max / 3)
  const yMax = step * 3
  const coords = points.map((p, i) => ({
    x: PAD.l + (points.length === 1 ? PLOT_W / 2 : (i * PLOT_W) / (points.length - 1)),
    y: PAD.t + PLOT_H * (1 - p.pv / yMax),
  }))
  const line = smoothPath(coords)
  const area =
    coords.length > 1
      ? `${line} L ${coords[coords.length - 1].x.toFixed(2)} ${PAD.t + PLOT_H} L ${coords[0].x.toFixed(2)} ${PAD.t + PLOT_H} Z`
      : ''
  const ticks = [0, 1, 2, 3].map((i) => ({
    value: step * i,
    y: PAD.t + PLOT_H * (1 - i / 3),
  }))
  const labelEvery = Math.max(1, Math.ceil(points.length / 7))
  const dotR = points.length > 12 ? 2 : 3

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    const ratio = (x - PAD.l) / PLOT_W
    const i = Math.round(ratio * (points.length - 1))
    setHover(Math.min(points.length - 1, Math.max(0, i)))
  }

  const strokeId = `stroke-${uid}`
  const areaId = `area-${uid}`

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-200">访问趋势</h4>
        <div className="flex items-center gap-1" role="tablist" aria-label="趋势时间范围">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={range === tab.key}
              onClick={() => {
                setRange(tab.key)
                setHover(null)
              }}
              className={
                'rounded-full px-2.5 py-1 text-[11px] transition-colors ' +
                (range === tab.key
                  ? 'border border-ice-400/30 bg-ice-400/15 font-medium text-ice-200'
                  : 'border border-transparent text-slate-500 hover:text-slate-300')
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-3">
        <svg key={range} viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="访问趋势折线图">
          <defs>
            <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#34d399" />
              <stop offset="0.4" stopColor="#38bdf8" />
              <stop offset="0.75" stopColor="#a78bfa" />
              <stop offset="1" stopColor="#e879f9" />
            </linearGradient>
            <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(56,189,248,0.3)" />
              <stop offset="1" stopColor="rgba(139,92,246,0.02)" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t.value}>
              <line x1={PAD.l} x2={W - PAD.r} y1={t.y} y2={t.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              <text x={PAD.l - 6} y={t.y + 3} textAnchor="end" fontSize="9" fill="#64748b">
                {formatCount(t.value)}
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            i % labelEvery === 0 || i === points.length - 1 ? (
              <text key={p.full} x={coords[i].x} y={H - 8} textAnchor="middle" fontSize="9" fill="#64748b">
                {p.label}
              </text>
            ) : null,
          )}

          {area && <path d={area} fill={`url(#${areaId})`} className="animate-[chart-fade_0.6s_ease_both]" />}
          {line && (
            <path
              d={line}
              fill="none"
              stroke={`url(#${strokeId})`}
              strokeWidth="2.5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              className="animate-[chart-draw_0.9s_ease_both]"
            />
          )}

          {coords.map((c, i) => (
            <circle
              key={i}
              cx={c.x}
              cy={c.y}
              r={hover === i ? dotR + 1.5 : dotR}
              fill={i === coords.length - 1 ? '#e879f9' : '#0a0f24'}
              stroke={i === coords.length - 1 ? '#f0abfc' : '#7dd3fc'}
              strokeWidth="1.5"
              className="animate-[chart-fade_0.5s_ease_both]"
              style={{ animationDelay: `${0.3 + i * 0.03}s` }}
            />
          ))}

          {hover !== null && coords[hover] && (
            <line
              x1={coords[hover].x}
              x2={coords[hover].x}
              y1={PAD.t}
              y2={PAD.t + PLOT_H}
              stroke="rgba(125,211,252,0.35)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          <rect
            x={PAD.l}
            y={PAD.t}
            width={PLOT_W}
            height={PLOT_H}
            fill="transparent"
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && coords[hover] && (
          <div
            className="glass-chip pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] text-slate-200"
            style={{ left: `${(coords[hover].x / W) * 100}%`, top: `${(coords[hover].y / H) * 100}%` }}
          >
            <span className="text-slate-400">{points[hover].full}</span>
            <span className="ml-1.5 font-semibold text-ice-300">{points[hover].pv} 次</span>
          </div>
        )}
      </div>
    </div>
  )
}