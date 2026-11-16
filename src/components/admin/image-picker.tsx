'use client'

import { useEffect, useRef, useState } from 'react'
import { ImageIcon, UploadIcon } from '@/components/icons'

export interface PickedImage {
  url: string
  width: number
  height: number
}

interface ImagePickerProps {
  value: string
  width?: number
  height?: number
  onChange: (img: PickedImage) => void
  square?: boolean
  hint?: string
}

/** 图片选择：上传到图床或粘贴 URL，带预览。URL 即时回传（保证可直接提交），自然尺寸异步精修（供瀑布流计算比例） */
export function ImagePicker({ value, width = 0, height = 0, onChange, square = false, hint }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [urlText, setUrlText] = useState(value)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- 外部 value 变化时同步输入框文本
  useEffect(() => setUrlText(value), [value])

  function readDims(url: string) {
    const img = new Image()
    img.onload = () => onChange({ url, width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => onChange({ url, width: 0, height: 0 })
    img.src = url
  }

  async function upload(file: File) {
    setBusy(true)
    setError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/uploads', { method: 'POST', body: form })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '上传失败')
        return
      }
      setUrlText(data.url)
      readDims(data.url)
    } finally {
      setBusy(false)
    }
  }

  const input =
    'w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-900'

  return (
    <div>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className={
            'relative shrink-0 overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50 transition-colors hover:border-orange-400 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-800 ' +
            (square ? 'h-28 w-28' : 'h-28 w-40')
          }
          title="点击上传图片"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="图片预览" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-stone-400">
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs">{busy ? '上传中…' : '点击上传'}</span>
            </span>
          )}
          {busy && value && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-white">
              上传中…
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            className={input}
            placeholder="图片 URL（上传后自动填入，也可直接粘贴）"
            value={urlText}
            onChange={(e) => {
              const url = e.target.value
              setUrlText(url)
              onChange({ url, width, height })
            }}
            onBlur={() => {
              const url = urlText.trim()
              if (url) readDims(url)
            }}
            maxLength={500}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3.5 py-1.5 text-xs text-stone-600 transition-colors hover:border-orange-400 hover:text-orange-600 disabled:opacity-50 dark:border-stone-700 dark:text-stone-300 dark:hover:text-orange-400"
          >
            <UploadIcon className="h-3.5 w-3.5" />
            {busy ? '上传中…' : '上传图片'}
          </button>
          {hint && <p className="text-xs text-stone-400">{hint}</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
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