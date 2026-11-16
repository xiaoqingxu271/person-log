'use client'

import { useRef, useState } from 'react'
import { MusicIcon, UploadIcon, XIcon } from '@/components/icons'

interface AudioPickerProps {
  value: string
  onChange: (url: string) => void
}

/** 音频选择：上传到图床（支持 Range 播放），带原生试听 */
export function AudioPicker({ value, onChange }: AudioPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function upload(file: File) {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/uploads/audio', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '上传失败')
        return
      }
      onChange(data.url)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 p-3.5 dark:border-stone-800">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1.5 text-sm font-medium text-stone-700 dark:text-stone-200">
          <MusicIcon className="h-4 w-4 text-orange-500" />
          站内音频
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3.5 py-1.5 text-xs text-stone-600 transition-colors hover:border-orange-400 hover:text-orange-600 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:text-orange-400"
        >
          <UploadIcon className="h-3.5 w-3.5" />
          {busy ? '上传中…' : '上传音频'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="inline-flex items-center gap-1 text-xs text-stone-400 transition-colors hover:text-red-500"
          >
            <XIcon className="h-3.5 w-3.5" />
            清除
          </button>
        )}
        <span className="text-xs text-stone-400">MP3/WAV/OGG/M4A/FLAC/AAC，≤30MB</span>
      </div>
      {value ? (
        <audio controls src={value} className="mt-2.5 h-9 w-full" />
      ) : (
        <p className="mt-2 text-xs text-stone-400">未上传音频，前台将回退为外链收听。</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/flac,audio/aac"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) upload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}