'use client'

import Image from 'next/image'
import { useAudio } from '@/components/audio/audio-context'
import {
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  ShuffleIcon,
  VolumeIcon,
  VolumeMuteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@/components/icons'

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const ctrlBtn =
  'inline-flex items-center justify-center rounded-full p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white'

/** 全站持久播放条：进度拖动 / 播放暂停 / 上下曲 / 随机 / 循环 / 音量静音 */
export function PlayerBar() {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    repeat,
    shuffle,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    cycleRepeat,
    toggleShuffle,
  } = useAudio()

  if (!current) return null

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="animate-fade-up fixed inset-x-0 bottom-0 z-50">
      <div className="glass-bar border-t border-white/12">
        <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-5">
          {/* 进度条 */}
          <div className="flex items-center gap-2.5 pt-2.5">
            <span className="w-9 text-right text-[10px] tabular-nums text-slate-400">{fmt(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              className="seek-range flex-1"
              style={{ '--progress': `${pct}%` } as React.CSSProperties}
              aria-label="播放进度"
            />
            <span className="w-9 text-[10px] tabular-nums text-slate-400">{fmt(duration)}</span>
          </div>

          <div className="flex items-center gap-3 py-2.5">
            {/* 封面 + 曲目信息（旋转黑胶） */}
            <div className="flex min-w-0 flex-1 items-center gap-3 md:w-60 md:flex-none">
              <span className="relative block h-11 w-11 shrink-0">
                {current.coverUrl ? (
                  <Image
                    src={current.coverUrl}
                    alt=""
                    width={44}
                    height={44}
                    className="spin-slow h-11 w-11 rounded-full border border-white/15 object-cover"
                    style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                  />
                ) : (
                  <span className="block h-11 w-11 rounded-full border border-white/15 bg-gradient-to-br from-night-700 to-night-800" />
                )}
                <span aria-hidden className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30 bg-night-950" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-white">{current.title}</span>
                <span className="block truncate text-xs text-slate-400">{current.artist}</span>
              </span>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center gap-0.5 sm:gap-1.5">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label={shuffle ? '关闭随机播放' : '开启随机播放'}
                aria-pressed={shuffle}
                className={`${ctrlBtn} hidden sm:inline-flex ${shuffle ? 'text-aurora-300' : ''}`}
                title="随机播放"
              >
                <ShuffleIcon className="h-4 w-4" />
              </button>
              <button type="button" onClick={prev} aria-label="上一首" className={ctrlBtn} title="上一首">
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? '暂停' : '播放'}
                className="aurora-btn inline-flex h-11 w-11 items-center justify-center rounded-full"
              >
                {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5 translate-x-[1px]" />}
              </button>
              <button type="button" onClick={next} aria-label="下一首" className={ctrlBtn} title="下一首">
                <ChevronRightIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                aria-label={`循环模式：${repeat === 'off' ? '关闭' : repeat === 'all' ? '列表循环' : '单曲循环'}`}
                className={`${ctrlBtn} relative hidden sm:inline-flex ${repeat !== 'off' ? 'text-aurora-300' : ''}`}
                title={repeat === 'one' ? '单曲循环' : repeat === 'all' ? '列表循环' : '循环播放'}
              >
                <RepeatIcon className="h-4 w-4" />
                {repeat === 'one' && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-aurora-400 text-[9px] font-bold text-night-950">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* 音量 */}
            <div className="hidden flex-1 items-center justify-end gap-2 md:flex">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? '取消静音' : '静音'}
                className={ctrlBtn}
                title={muted ? '取消静音' : '静音'}
              >
                {muted || volume === 0 ? <VolumeMuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="volume-range w-24"
                style={{ '--progress': `${(muted ? 0 : volume) * 100}%` } as React.CSSProperties}
                aria-label="音量"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}