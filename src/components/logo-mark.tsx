/** 站点标识：深色圆角方块 + 衬线体 P + 橙色圆点（与 src/app/icon.svg 同款） */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#1C1917" stroke="rgba(255,255,255,0.10)" />
      <text
        x="30"
        y="44"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="36"
        fontWeight="700"
        fill="#F97316"
        textAnchor="middle"
      >
        P
      </text>
      <circle cx="46" cy="40" r="4" fill="#F97316" />
    </svg>
  )
}
