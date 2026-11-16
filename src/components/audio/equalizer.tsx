/** 播放中均衡器动画条 */
export function Equalizer({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex h-4 items-end gap-[2px] ${className}`} aria-hidden>
      <span className="eq-bar w-[3px] rounded-full bg-aurora-300" style={{ animationDelay: '0ms' }} />
      <span className="eq-bar w-[3px] rounded-full bg-ice-300" style={{ animationDelay: '180ms' }} />
      <span className="eq-bar w-[3px] rounded-full bg-nebula-300" style={{ animationDelay: '360ms' }} />
      <span className="eq-bar w-[3px] rounded-full bg-flare-300" style={{ animationDelay: '90ms' }} />
    </span>
  )
}