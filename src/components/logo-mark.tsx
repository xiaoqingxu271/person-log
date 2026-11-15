/** 站点标识：极光渐变星系漩涡（与 src/app/icon.svg 同款） */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-galaxy" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="0.5" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#logo-galaxy)" strokeWidth="5" strokeLinecap="round">
        <path d="M32 9c14 0 23 9 23 21 0 12-9 20-19 20-9 0-15-6-15-13 0-7 5-11 11-11 5 0 8 3 8 7" />
        <path d="M32 55c-14 0-23-9-23-21 0-12 9-20 19-20 9 0 15 6 15 13 0 7-5 11-11 11-5 0-8-3-8-7" opacity="0.7" />
      </g>
      <circle cx="32" cy="32" r="3.2" fill="#e0f2fe" />
      <circle cx="51" cy="13" r="1.6" fill="#c4b5fd" />
      <circle cx="13" cy="51" r="1.4" fill="#7dd3fc" />
    </svg>
  )
}