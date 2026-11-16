'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Photo } from '@prisma/client'
import { ImagePicker } from '@/components/admin/image-picker'
import { formatDate } from '@/lib/format'
import { MapPinIcon, PencilIcon, PlusIcon, XIcon } from '@/components/icons'

interface PhotoForm {
  title: string
  imageUrl: string
  width: number
  height: number
  description: string
  location: string
  takenAt: string
}

const EMPTY: PhotoForm = { title: '', imageUrl: '', width: 0, height: 0, description: '', location: '', takenAt: '' }

const input =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-900'

/** 相册管理：新增/编辑/显示隐藏/删除 */
export function PhotoManager({ items }: { items: Photo[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState<PhotoForm>(EMPTY)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  function set<K extends keyof PhotoForm>(key: K, value: PhotoForm[K]) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function startEdit(item: Photo) {
    setEditingId(item.id)
    setForm({
      title: item.title,
      imageUrl: item.imageUrl,
      width: item.width,
      height: item.height,
      description: item.description,
      location: item.location,
      takenAt: item.takenAt ? formatDate(item.takenAt) : '',
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
      const res = await fetch(editingId ? `/api/photos/${editingId}` : '/api/photos', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error ?? '保存失败' })
        return
      }
      setMessage({ type: 'ok', text: editingId ? '已保存修改' : '已添加照片' })
      setForm(EMPTY)
      setEditingId(null)
      router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function toggle(item: Photo) {
    const res = await fetch(`/api/photos/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !item.isVisible }),
    })
    if (res.ok) router.refresh()
  }

  async function remove(item: Photo) {
    if (!confirm(`确定删除照片「${item.title}」？`)) return
    const res = await fetch(`/api/photos/${item.id}`, { method: 'DELETE' })
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
            {editingId ? `编辑照片 #${editingId}` : '添加照片'}
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
          <ImagePicker
            value={form.imageUrl}
            width={form.width}
            height={form.height}
            onChange={(img) => setForm((p) => ({ ...p, imageUrl: img.url, width: img.width, height: img.height }))}
            hint="横竖图均可，前台按原始比例瀑布流展示"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input className={input} placeholder="照片标题 *" value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} />
            <input className={input} placeholder="拍摄地点（可选）" value={form.location} onChange={(e) => set('location', e.target.value)} maxLength={100} />
            <label className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
              拍摄日期
              <input type="date" className={input} value={form.takenAt} onChange={(e) => set('takenAt', e.target.value)} />
            </label>
          </div>

          <textarea
            className={input + ' min-h-20 resize-y'}
            placeholder="照片背后的故事（可选）"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            maxLength={500}
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-stone-900 px-5 py-1.5 text-sm text-white transition-colors hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {busy ? '保存中…' : editingId ? '保存修改' : '添加照片'}
            </button>
            {message && (
              <span className={`text-sm ${message.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>{message.text}</span>
            )}
          </div>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-stone-400">还没有照片，用上方表单添加第一张。</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className={
                'overflow-hidden rounded-2xl border bg-white dark:bg-stone-900 ' +
                (item.isVisible ? 'border-stone-200 dark:border-stone-800' : 'border-dashed border-stone-300 opacity-60 dark:border-stone-700')
              }
            >
              <div className="relative h-36 bg-stone-100 dark:bg-stone-800">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs text-stone-400">无图片</span>
                )}
              </div>
              <div className="p-3.5">
                <p className="truncate text-sm font-medium text-stone-900 dark:text-stone-100">{item.title}</p>
                <p className="mt-0.5 flex items-center gap-2 truncate text-xs text-stone-400">
                  {item.location && (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPinIcon className="h-3 w-3" />
                      {item.location}
                    </span>
                  )}
                  {item.takenAt && <span>{formatDate(item.takenAt)}</span>}
                </p>
                <div className="mt-2.5 flex items-center gap-3 border-t border-stone-100 pt-2.5 text-xs dark:border-stone-800">
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
                  <button type="button" onClick={() => remove(item)} className="ml-auto text-red-600 transition-colors hover:underline dark:text-red-500">
                    删除
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}