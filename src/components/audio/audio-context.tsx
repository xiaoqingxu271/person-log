'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export interface Track {
  id: number
  title: string
  artist: string
  coverUrl: string
  audioUrl: string
}

export type RepeatMode = 'off' | 'all' | 'one'

interface AudioState {
  current: Track | null
  queue: Track[]
  index: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  repeat: RepeatMode
  shuffle: boolean
  play: (track: Track, list: Track[]) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (t: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  cycleRepeat: () => void
  toggleShuffle: () => void
}

const AudioContext = createContext<AudioState | null>(null)

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio 必须在 AudioProvider 内使用')
  return ctx
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Track[]>([])
  const [index, setIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [repeat, setRepeat] = useState<RepeatMode>('off')
  const [shuffle, setShuffle] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const loadedIdRef = useRef<number | null>(null)
  const stateRef = useRef({ queue, index, repeat, shuffle, volume })
  const endedRef = useRef<() => void>(() => {})

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current
    const a = new Audio()
    a.preload = 'metadata'
    a.volume = stateRef.current.volume
    a.addEventListener('timeupdate', () => setCurrentTime(a.currentTime))
    a.addEventListener('loadedmetadata', () => setDuration(Number.isFinite(a.duration) ? a.duration : 0))
    a.addEventListener('durationchange', () => setDuration(Number.isFinite(a.duration) ? a.duration : 0))
    a.addEventListener('play', () => setIsPlaying(true))
    a.addEventListener('playing', () => setIsPlaying(true))
    a.addEventListener('pause', () => setIsPlaying(false))
    a.addEventListener('ended', () => endedRef.current())
    audioRef.current = a
    return a
  }, [])

  const play = useCallback(
    (track: Track, list: Track[]) => {
      if (!track.audioUrl) return
      const a = ensureAudio()
      const idx = list.findIndex((t) => t.id === track.id)
      setQueue(list)
      setIndex(idx >= 0 ? idx : 0)
      if (loadedIdRef.current !== track.id) {
        a.src = track.audioUrl
        loadedIdRef.current = track.id
        setCurrentTime(0)
        setDuration(0)
      }
      a.play().catch(() => {})
    },
    [ensureAudio],
  )

  const advance = useCallback(
    (dir: number, auto: boolean) => {
      const { queue: q, index: i, shuffle: sh, repeat: rp } = stateRef.current
      if (q.length === 0) return
      let nextIdx: number
      if (sh && q.length > 1) {
        do {
          nextIdx = Math.floor(Math.random() * q.length)
        } while (nextIdx === i)
      } else {
        nextIdx = i + dir
        if (nextIdx >= q.length) {
          if (auto && rp === 'off') {
            setIsPlaying(false)
            return
          }
          nextIdx = 0
        }
        if (nextIdx < 0) nextIdx = q.length - 1
      }
      play(q[nextIdx], q)
    },
    [play],
  )

  useEffect(() => {
    stateRef.current = { queue, index, repeat, shuffle, volume }
  }, [queue, index, repeat, shuffle, volume])

  useEffect(() => {
    endedRef.current = () => {
      const a = audioRef.current
      if (stateRef.current.repeat === 'one' && a) {
        a.currentTime = 0
        a.play().catch(() => {})
        return
      }
      advance(1, true)
    }
  }, [advance])

  const toggle = useCallback(() => {
    const { queue: q, index: i } = stateRef.current
    const a = audioRef.current
    if (!a || i < 0 || !q[i]) {
      if (q.length > 0) play(q[0], q)
      return
    }
    if (a.paused) a.play().catch(() => {})
    else a.pause()
  }, [play])

  const next = useCallback(() => advance(1, false), [advance])
  const prev = useCallback(() => {
    const a = audioRef.current
    if (a && a.currentTime > 3) {
      a.currentTime = 0
      return
    }
    advance(-1, false)
  }, [advance])

  const seek = useCallback((t: number) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = t
    setCurrentTime(t)
  }, [])

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    const a = ensureAudio()
    a.volume = clamped
    setVolumeState(clamped)
    if (clamped > 0 && a.muted) {
      a.muted = false
      setMuted(false)
    }
  }, [ensureAudio])

  const toggleMute = useCallback(() => {
    const a = ensureAudio()
    a.muted = !a.muted
    setMuted(a.muted)
  }, [ensureAudio])

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'))
  }, [])

  const toggleShuffle = useCallback(() => setShuffle((s) => !s), [])

  useEffect(() => {
    return () => {
      const a = audioRef.current
      if (a) {
        a.pause()
        a.src = ''
      }
    }
  }, [])

  const current = index >= 0 && index < queue.length ? queue[index] : null

  const value: AudioState = {
    current,
    queue,
    index,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    repeat,
    shuffle,
    play,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    cycleRepeat,
    toggleShuffle,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}