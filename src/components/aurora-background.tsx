import Image from 'next/image'

/** 全站固定背景：极光夜景照片 + 压暗渐变 + 漂移光晕 + 星点 + 颗粒 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="aurora-scene">
      <Image
        src="/images/aurora-bg.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="object-cover"
      />
      <div className="aurora-glow aurora-glow-a" />
      <div className="aurora-glow aurora-glow-b" />
      <div className="aurora-stars" />
      <div className="aurora-scene-scrim" />
      <div className="aurora-grain" />
    </div>
  )
}