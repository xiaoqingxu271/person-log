'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarkdownView } from '@/lib/markdown'

export interface EditorPost {
  id?: number
  title: string
  slug: string
  summary: string
  contentMd: string
  coverUrl: string
  status: 'draft' | 'published'
  isPinned: boolean
  categoryName: string
  tagNames: string
}

const emptyPost: EditorPost = {
  title: '',
  slug: '',
  summary: '',
  contentMd: '',
  coverUrl: '',
  status: 'draft',
  isPinned: false,
  categoryName: '',
  tagNames: '',
}

const DRAFT_KEY = 'personlog_draft_new'

export function PostEditor({ post, categories }: { post?: EditorPost; categories: string[] }) {
  const router = useRouter()
  const [form, setForm] = useState<EditorPost>(post ?? emptyPost)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [restored, setRestored] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isNew = !post
  const isEditing = Boolean(form.id)

  // 新建时把内容自动暂存到浏览器本地，防止意外丢失
  useEffect(() => {
    if (!isNew) return
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      try {
        setForm({ ...emptyPost, ...JSON.parse(saved) })
        setRestored(true)
      } catch {
        localStorage.removeItem(DRAFT_KEY)
      }
    }
  }, [isNew])

  useEffect(() => {
    if (!isNew) return
    const timer = setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify(form)), 800)
    return () => clearTimeout(timer)
  }, [form, isNew])

  function set<K extends keyof EditorPost>(key: K, value: EditorPost[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function uploadFiles(files: FileList | File[]) {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (images.length === 0) return
    setUploading(true)
    try {
      for (const file of images.slice(0, 5)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/uploads', { method: 'POST', body: fd })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          alert(data.error ?? '图片上传失败')
          continue
        }
        insertAtCursor(`\n![${file.name.replace(/\.[^.]+$/, '')}](${data.url})\n`)
      }
    } finally {
      setUploading(false)
    }
  }

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current
    const content = form.contentMd
    if (!el) {
      set('contentMd', content + snippet)
      return
    }
    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? start
    set('contentMd', content.slice(0, start) + snippet + content.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + snippet.length
      el.setSelectionRange(pos, pos)
    })
  }

  async function handleSave() {
    if (!form.title.trim() || !form.contentMd.trim()) {
      setError('标题和正文不能为空')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(isEditing ? `/api/posts/${form.id}` : '/api/posts', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '保存失败，请重试')
        return
      }
      if (isNew) localStorage.removeItem(DRAFT_KEY)
      router.push('/admin/posts')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const input =
    'w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900'
  const label = 'text-sm font-medium text-neutral-600 dark:text-neutral-300'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{isEditing ? '编辑文章' : '写文章'}</h1>
        <button
          type="button"
          onClick={() => setPreview((v) => !v)}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          {preview ? '继续编辑' : '预览'}
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <input
          className="w-full rounded border border-neutral-300 bg-white px-3 py-2.5 text-xl font-semibold focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
          placeholder="文章标题"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={label} htmlFor="slug">
              Slug（URL 标识，仅字母数字连字符，留空自动生成）
            </label>
            <input
              id="slug"
              className={input}
              placeholder="如 my-first-post"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="category">
              分类（填入名称即可，不存在会自动创建）
            </label>
            <input
              id="category"
              className={input}
              placeholder="如 技术笔记"
              value={form.categoryName}
              onChange={(e) => set('categoryName', e.target.value)}
              list="category-options"
            />
            <datalist id="category-options">
              {categories.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="tags">
              标签（用顿号/逗号分隔，最多 10 个）
            </label>
            <input
              id="tags"
              className={input}
              placeholder="如 前端、React"
              value={form.tagNames}
              onChange={(e) => set('tagNames', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className={label} htmlFor="cover">
              封面图 URL（可选）
            </label>
            <input
              id="cover"
              className={input}
              placeholder="https://…"
              value={form.coverUrl}
              onChange={(e) => set('coverUrl', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={label} htmlFor="summary">
            摘要（列表页展示，留空则不显示）
          </label>
          <textarea
            id="summary"
            className={`${input} h-16 resize-none`}
            value={form.summary}
            onChange={(e) => set('summary', e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <label className={label} htmlFor="content">
                正文（Markdown）
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded border border-neutral-300 px-2 py-0.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {uploading ? '上传中…' : '插入图片'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) uploadFiles(e.target.files)
                  e.target.value = ''
                }}
              />
            </div>
            {isNew && restored && (
              <span className="text-xs text-amber-600 dark:text-amber-500">已恢复上次未保存的本地草稿</span>
            )}
          </div>
          {preview ? (
            <div className="min-h-[420px] rounded border border-neutral-200 p-4 dark:border-neutral-800">
              <MarkdownView content={form.contentMd || '*暂无内容*'} />
            </div>
          ) : (
            <textarea
              id="content"
              ref={textareaRef}
              className={`${input} min-h-[420px] font-mono leading-relaxed`}
              placeholder="# 用 Markdown 书写…（支持直接粘贴或拖拽图片）"
              value={form.contentMd}
              onChange={(e) => set('contentMd', e.target.value)}
              onPaste={(e) => {
                if (e.clipboardData.files.length > 0) {
                  e.preventDefault()
                  uploadFiles(e.clipboardData.files)
                }
              }}
              onDrop={(e) => {
                if (e.dataTransfer.files.length > 0) {
                  e.preventDefault()
                  uploadFiles(e.dataTransfer.files)
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            />
          )}
          <p className="text-xs text-neutral-400">图片会保存到服务器 data/uploads 目录</p>
        </div>

        <div className="flex items-center gap-6 border-t border-neutral-100 pt-5 dark:border-neutral-800">
          <label className={`${label} flex items-center gap-2`} htmlFor="status">
            状态
            <select
              id="status"
              className="rounded border border-neutral-300 bg-white px-2 py-1.5 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
              value={form.status}
              onChange={(e) => set('status', e.target.value as EditorPost['status'])}
            >
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </select>
          </label>
          <label className={`${label} flex items-center gap-2`}>
            <input
              type="checkbox"
              checked={form.isPinned}
              onChange={(e) => set('isPinned', e.target.checked)}
            />
            置顶
          </label>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-neutral-900 px-5 py-2 text-sm text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {saving ? '保存中…' : '保存'}
          </button>
          {isNew && !restored && (
            <span className="text-xs text-neutral-400">新建内容会自动暂存在浏览器本地</span>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}
