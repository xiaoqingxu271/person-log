'use client'

import { AudioProvider, useAudio } from '@/components/audio/audio-context'
import { PlayerBar } from '@/components/audio/player-bar'

/** 播放条占位：有曲目时在页脚后撑出高度，避免内容被固定播放条遮挡 */
function PlayerSpacer() {
  const { current } = useAudio()
  return current ? <div aria-hidden className="h-24" /> : null
}

/** 全站音频根：包裹站点内容，提供播放上下文与持久播放条 */
export function AudioRoot({ children }: { children: React.ReactNode }) {
  return (
    <AudioProvider>
      {children}
      <PlayerSpacer />
      <PlayerBar />
    </AudioProvider>
  )
}