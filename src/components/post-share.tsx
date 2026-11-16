'use client'

import { useState } from 'react'
import { LinkIcon, QrIcon, ShareIcon } from '@/components/icons'

const chip =
  'glass-chip inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs text-slate-300 transition-colors hover:border-ice-400/40 hover:text-ice-300'

/** 文章分享：复制链接、微博/X、二维码（按需生成） */
export function PostShare({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrData, setQrData] = useState('')
  const [qrBusy, setQrBusy] = useState(false)
  const [error, setError] = useState('')

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      el.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  async function toggleQr() {
    if (qrOpen) {
      setQrOpen(false)
      return
    }
    if (!qrData) {
      setQrBusy(true)
      setError('')
      try {
        const QRCode = (await import('qrcode')).default
        const data = await QRCode.toDataURL(url, {
          width: 240,
          margin: 1,
          color: { dark: '#0b1020', light: '#ffffff' },
        })
        setQrData(data)
      } catch {
        setError('二维码生成失败')
        return
      } finally {
        setQrBusy(false)
      }
    }
    setQrOpen(true)
  }

  const weibo = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  const x = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`

  return (
    <div className="sm:text-right">
      <p className="flex items-center gap-1.5 text-xs font-medium text-slate-400 sm:justify-end">
        <ShareIcon className="h-3.5 w-3.5" />
        分享本文
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2 sm:justify-end">
        <button type="button" onClick={copyLink} className={chip}>
          <LinkIcon className="h-3.5 w-3.5" />
          {copied ? '已复制' : '复制链接'}
        </button>
        <a href={weibo} target="_blank" rel="noreferrer" className={chip}>
          微博
        </a>
        <a href={x} target="_blank" rel="noreferrer" className={chip}>
          X
        </a>
        <button
          type="button"
          onClick={toggleQr}
          disabled={qrBusy}
          aria-expanded={qrOpen}
          className={chip}
        >
          <QrIcon className="h-3.5 w-3.5" />
          {qrBusy ? '生成中…' : '二维码'}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-flare-300">{error}</p>}

      {qrOpen && qrData && (
        <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element -- 二维码为运行时生成的 data URL */}
          <img src={qrData} alt="文章二维码" width={96} height={96} className="rounded-lg" />
          <span className="pr-2 text-left text-xs leading-relaxed text-stone-500">
            扫码阅读
            <br />
            或分享给朋友
          </span>
        </div>
      )}
    </div>
  )
}
