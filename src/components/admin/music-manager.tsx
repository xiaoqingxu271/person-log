'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MusicItem } from '@prisma/client'
import { ImagePicker } from '@/components/admin/image-picker'
import { AudioPicker } from '@/components/admin/audio-picker'
import { MusicIcon, PencilIcon, PlusIcon, StarIcon, XIcon } from '@/components/icons'

interface MusicForm {
  title: string
  artist: string
  coverUrl: string
  audioUrl: string
  genre: string
  rating: number
  review: string
  listenUrl: string
}

const EMPTY: MusicForm = { title: '', artist: '', coverUrl: '', audioUrl: '', genre: '', rating: 0, review: '', listenUrl: '' }

const input =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-900'

/** 音乐库管理：新增/编辑/显示隐藏/删除 */
export function MusicManager({ items }: { items: MusicItem[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState<MusicForm>(EMPTY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const genres = [...new Set(items.map((i) => i.genre).filter(Boolean))]

  function set<K extends keyof MusicForm>(key: K, value: MusicForm[K]) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function startEdit(item: MusicItem) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      artist: item.artist,
      coverUrl: item.coverUrl,
      audioUrl: item.audioUrl,
      genre: item.genre,
      rating: item.rating,
      review: item.review,
      listenUrl: item.listenUrl,
    })
    setMessage(null)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY)
    setMessage(null)
  }

  async function submit() {
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch(editingId ? `/api/music/${editingId}` : '/api/music', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error ?? '保存失败' })
        return
      }
      setMessage({ type: 'ok', text: editingId ? '已保存修改' : '已添加专辑' })
      setForm(EMPTY)
      setEditingId(null)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function toggle(item: MusicItem) {
    const res = await fetch(`/api/music/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !item.isVisible }),
    })
    if (res.ok) router.refresh()
  }

  async function remove(item: MusicItem) {
    if (!confirm(`确定删除《${item.title}》？`)) return
    const res = await fetch(`/api/music/${item.id}`, { method: 'DELETE' })
    if (res.ok) {
      if (editingId === item.id) cancelEdit()
      router.refresh()
    }
  }

  return (
    <div>
      <div ref={formRef} className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-white">
            {editingId ? <PencilIcon className="h-4 w-4 text-orange-500" /> : <PlusIcon className="h-4 w-4 text-orange-500" />}
            {editingId ? `编辑专辑 #${editingId}` : '添加专辑'}
          </h2>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1 text-xs text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-200">
              <XIcon className="h-3.5 w-3.5" />
              取消编辑
            </button>
          )}
        </div>

        <form
          className="mt-4 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className={input} placeholder="专辑名称 *" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} />
            <input className={input} placeholder="艺术家 *" value={form.artist} onChange={(e) => set('artist', e.target.value)} maxLength={200} />
            <input className={input} placeholder="风格（如：流行 / 摇滚 / 新古典）" value={form.genre} onChange={(e) => set('genre', e.target.value)} maxLength={50} list="music-genres" />
            <datalist id="music-genres">
              {genres.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
            <input className={input} placeholder="收听链接（网易云/QQ音乐等，可选）" value={form.listenUrl} onChange={(e) => set('listenUrl', e.target.value)} maxLength={500} />
          </div>

          <ImagePicker value={form.coverUrl} onChange={(img) => set('coverUrl', img.url)} square hint="建议正方形封面图，将展示在音乐库卡片上" />

          <AudioPicker value={form.audioUrl} onChange={(url) => set('audioUrl', url)} />

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-stone-500 dark:text-stone-400">评分</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('rating', n === form.rating ? 0 : n)}
                  aria-label={`${n} 星`}
                  className="rounded p-0.5 transition-transform hover:scale-110"
                >
                  <StarIcon className={'h-5 w-5 ' + (n <= form.rating ? 'text-amber-400' : 'text-stone-300 dark:text-stone-600')} filled={n <= form.rating} />
                </button>
              ))}
            </div>
            <span className="text-xs text-stone-400">{form.rating > 0 ? `${form.rating} 星（再点一次取消）` : '未评分'}</span>
          </div>

          <textarea
            className={input + ' min-h-20 resize-y'}
            placeholder="一句话乐评：为什么喜欢这张专辑？（可选）"
            value={form.review}
            onChange={(e) => set('review', e.target.value)}
            maxLength={1000}
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-stone-900 px-5 py-1.5 text-sm text-white transition-colors hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {busy ? '保存中…' : editingId ? '保存修改' : '添加专辑'}
            </button>
            {message && (
              <span className={`text-sm ${message.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>{message.text}</span>
            )}
          </div>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-stone-400">还没有专辑，用上方表单添加第一张。</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={
                'flex items-center gap-4 rounded-2xl border bg-white p-4 dark:bg-stone-900 ' +
                (item.isVisible ? 'border-stone-200 dark:border-stone-800' : 'border-dashed border-stone-300 opacity-60 dark:border-stone-700')
              }
            >
              <span className="block h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-100 dark:bg-stone-800">
                {item.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-stone-400">无封面</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">
                  {item.title}
                  <span className="ml-2 text-xs font-normal text-stone-400">{item.artist}</span>
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-stone-400">
                  {item.genre && <span className="rounded-full bg-stone-100 px-2 py-0.5 dark:bg-stone-800">{item.genre}</span>}
                  {item.audioUrl && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                      <MusicIcon className="h-3 w-3" />
                      可播放
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <StarIcon key={n} className={'h-3 w-3 ' + (n <= item.rating ? 'text-amber-400' : 'text-stone-300 dark:text-stone-600')} filled={n <= item.rating} />
                    ))}
                  </span>
                  {item.review && <span className="truncate">{item.review}</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-xs">
                <button type="button" onClick={() => startEdit(item)} className="text-stone-500 transition-colors hover:underline dark:text-stone-400">
                  编辑
                </button>
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  className={'transition-colors hover:underline ' + (item.isVisible ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400')}
                >
                  {item.isVisible ? '显示中' : '已隐藏'}
                </button>
                <button type="button" onClick={() => remove(item)} className="text-red-600 transition-colors hover:underline dark:text-red-500">
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}