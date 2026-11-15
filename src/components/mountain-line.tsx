/** 线描雪山装饰（渐变描边 + 雪顶），用于卡片角落与 profile 卡底部 */
export function MountainLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 70" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="mtn-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="0.55" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#e879f9" />
        </linearGradient>
      </defs>
      <path
        d="M4 66 34 26l14 18 12-14 22 36M60 66 92 14l18 26 10-12 36 38"
        stroke="url(#mtn-g)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 34l6-8 6 8-3-2-3 3-3-3ZM86 24l6-10 6 10-3-2-3 3-3-3Z" fill="#e0f2fe" opacity="0.9" />
      <path d="M10 66h140" stroke="url(#mtn-g)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="132" cy="12" r="1.6" fill="#bae6fd" />
      <circle cx="146" cy="24" r="1.2" fill="#c4b5fd" />
      <circle cx="20" cy="12" r="1.2" fill="#f0abfc" />
    </svg>
  )
}