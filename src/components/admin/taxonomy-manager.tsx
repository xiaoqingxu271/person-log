'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export interface CategoryAdminRow {
  id: number
  name: string
  slug: string
  description: string
  count: number
}

export interface TagAdminRow {
  id: number
  name: string
  slug: string
  count: number
}

interface Props {
  initialCategories: CategoryAdminRow[]
  initialTags: TagAdminRow[]
}

const inputCls =
  'w-full min-w-0 rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-950'
const btnCls =
  'rounded-lg border border-stone-300 px-2.5 py-1.5 text-xs transition-colors hover:bg-stone-50 disabled:opacity-50 dark:border-stone-700 dark:hover:bg-stone-800'
const primaryBtnCls =
  'rounded-lg bg-stone-900 px-3 py-1.5 text-xs text-white transition-colors hover:bg-stone-700 disabled:opacity-50 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200'

export function TaxonomyManager({ initialCategories, initialTags }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [tags, setTags] = useState(initialTags)
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '' })
  const [newTag, setNewTag] = useState({ name: '', slug: '' })
  const [catMerge, setCatMerge] = useState<Record<number, string>>({})
  const [tagMerge, setTagMerge] = useState<Record<number, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // router.refresh() 后若服务端数据变化，用渲染期同步避免多余的一次 effect 渲染
  const [syncedProps, setSyncedProps] = useState({
    categories: initialCategories,
    tags: initialTags,
  })
  if (
    syncedProps.categories !== initialCategories ||
    syncedProps.tags !== initialTags
  ) {
    setSyncedProps({ categories: initialCategories, tags: initialTags })
    setCategories(initialCategories)
    setTags(initialTags)
  }

  async function api(url: string, method: string, body?: unknown) {
    const res = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error((data as { error?: string }).error ?? '操作失败，请重试')
  }

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await action()
      setNotice(success)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败，请重试')
    } finally {
      setBusy(false)
    }
  }

  function updateCategory(id: number, key: 'name' | 'slug' | 'description', value: string) {
    setCategories((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  function updateTag(id: number, key: 'name' | 'slug', value: string) {
    setTags((prev) => prev.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  function createCategory(e: React.FormEvent) {
    e.preventDefault()
    void run(async () => {
      await api('/api/categories', 'POST', newCategory)
      setNewCategory({ name: '', slug: '', description: '' })
    }, '分类已创建')
  }

  function createTag(e: React.FormEvent) {
    e.preventDefault()
    void run(async () => {
      await api('/api/tags', 'POST', newTag)
      setNewTag({ name: '', slug: '' })
    }, '标签已创建')
  }

  function saveCategory(row: CategoryAdminRow) {
    void run(
      () => api(`/api/categories/${row.id}`, 'PUT', {
        name: row.name,
        slug: row.slug,
        description: row.description,
      }),
      '分类已保存',
    )
  }

  function removeCategory(row: CategoryAdminRow) {
    if (!window.confirm(`确定删除分类「${row.name}」？其下文章会变为未分类。`)) return
    void run(() => api(`/api/categories/${row.id}`, 'DELETE'), '分类已删除')
  }

  function mergeCategory(row: CategoryAdminRow) {
    const targetId = catMerge[row.id]
    if (!targetId) {
      setError('请选择要合并到的目标分类')
      return
    }
    if (!window.confirm(`将分类「${row.name}」下的文章迁移到目标分类，并删除该分类？`)) return
    void run(
      () => api(`/api/categories/${row.id}/merge`, 'POST', { targetId: Number(targetId) }),
      '分类已合并',
    )
  }

  function saveTag(row: TagAdminRow) {
    void run(
      () => api(`/api/tags/${row.id}`, 'PUT', { name: row.name, slug: row.slug }),
      '标签已保存',
    )
  }

  function removeTag(row: TagAdminRow) {
    if (!window.confirm(`确定删除标签「${row.name}」？文章将失去该标签。`)) return
    void run(() => api(`/api/tags/${row.id}`, 'DELETE'), '标签已删除')
  }

  function mergeTag(row: TagAdminRow) {
    const targetId = tagMerge[row.id]
    if (!targetId) {
      setError('请选择要合并到的目标标签')
      return
    }
    if (!window.confirm(`将标签「${row.name}」的文章关联迁移到目标标签，并删除该标签？`)) return
    void run(
      () => api(`/api/tags/${row.id}/merge`, 'POST', { targetId: Number(targetId) }),
      '标签已合并',
    )
  }

  return (
    <div>
      {(error || notice) && (
        <p
          className={
            'mb-4 rounded-xl px-4 py-2.5 text-sm ' +
            (error
              ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400')
          }
        >
          {error || notice}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-stone-900 dark:text-white">分类</h2>
            <span className="text-xs text-stone-400">{categories.length} 个</span>
          </div>

          <form onSubmit={createCategory} className="mt-4 space-y-2 rounded-xl bg-stone-50 p-3 dark:bg-stone-950/60">
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="新分类名称"
                value={newCategory.name}
                onChange={(e) => setNewCategory((v) => ({ ...v, name: e.target.value }))}
                required
                maxLength={50}
              />
              <button type="submit" disabled={busy} className={primaryBtnCls}>
                新增
              </button>
            </div>
            <input
              className={inputCls}
              placeholder="slug（留空同名称）"
              value={newCategory.slug}
              onChange={(e) => setNewCategory((v) => ({ ...v, slug: e.target.value }))}
              maxLength={100}
            />
            <input
              className={inputCls}
              placeholder="描述（可选）"
              value={newCategory.description}
              onChange={(e) => setNewCategory((v) => ({ ...v, description: e.target.value }))}
              maxLength={500}
            />
          </form>

          <ul className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
            {categories.length === 0 && (
              <li className="py-6 text-center text-sm text-stone-400">还没有分类</li>
            )}
            {categories.map((row) => (
              <li key={row.id} className="space-y-2 py-3">
                <div className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    aria-label="分类名称"
                    value={row.name}
                    onChange={(e) => updateCategory(row.id, 'name', e.target.value)}
                    maxLength={50}
                  />
                  <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                    {row.count} 篇
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputCls}
                    aria-label="分类 slug"
                    placeholder="slug"
                    value={row.slug}
                    onChange={(e) => updateCategory(row.id, 'slug', e.target.value)}
                    maxLength={100}
                  />
                  <input
                    className={inputCls}
                    aria-label="分类描述"
                    placeholder="描述"
                    value={row.description}
                    onChange={(e) => updateCategory(row.id, 'description', e.target.value)}
                    maxLength={500}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" disabled={busy} onClick={() => saveCategory(row)} className={primaryBtnCls}>
                    保存
                  </button>
                  <select
                    aria-label="合并目标分类"
                    className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-700 dark:bg-stone-950"
                    value={catMerge[row.id] ?? ''}
                    onChange={(e) => setCatMerge((v) => ({ ...v, [row.id]: e.target.value }))}
                  >
                    <option value="">合并到…</option>
                    {categories
                      .filter((item) => item.id !== row.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy || categories.length < 2}
                    onClick={() => mergeCategory(row)}
                    className={btnCls}
                  >
                    合并
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeCategory(row)}
                    className="ml-auto rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-stone-900 dark:text-white">标签</h2>
            <span className="text-xs text-stone-400">{tags.length} 个</span>
          </div>

          <form onSubmit={createTag} className="mt-4 space-y-2 rounded-xl bg-stone-50 p-3 dark:bg-stone-950/60">
            <div className="flex gap-2">
              <input
                className={inputCls}
                placeholder="新标签名称"
                value={newTag.name}
                onChange={(e) => setNewTag((v) => ({ ...v, name: e.target.value }))}
                required
                maxLength={50}
              />
              <button type="submit" disabled={busy} className={primaryBtnCls}>
                新增
              </button>
            </div>
            <input
              className={inputCls}
              placeholder="slug（留空同名称）"
              value={newTag.slug}
              onChange={(e) => setNewTag((v) => ({ ...v, slug: e.target.value }))}
              maxLength={100}
            />
          </form>

          <ul className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
            {tags.length === 0 && (
              <li className="py-6 text-center text-sm text-stone-400">还没有标签</li>
            )}
            {tags.map((row) => (
              <li key={row.id} className="space-y-2 py-3">
                <div className="flex items-center gap-2">
                  <input
                    className={inputCls}
                    aria-label="标签名称"
                    value={row.name}
                    onChange={(e) => updateTag(row.id, 'name', e.target.value)}
                    maxLength={50}
                  />
                  <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                    {row.count} 篇
                  </span>
                </div>
                <input
                  className={inputCls}
                  aria-label="标签 slug"
                  placeholder="slug"
                  value={row.slug}
                  onChange={(e) => updateTag(row.id, 'slug', e.target.value)}
                  maxLength={100}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" disabled={busy} onClick={() => saveTag(row)} className={primaryBtnCls}>
                    保存
                  </button>
                  <select
                    aria-label="合并目标标签"
                    className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-700 dark:bg-stone-950"
                    value={tagMerge[row.id] ?? ''}
                    onChange={(e) => setTagMerge((v) => ({ ...v, [row.id]: e.target.value }))}
                  >
                    <option value="">合并到…</option>
                    {tags
                      .filter((item) => item.id !== row.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    disabled={busy || tags.length < 2}
                    onClick={() => mergeTag(row)}
                    className={btnCls}
                  >
                    合并
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => removeTag(row)}
                    className="ml-auto rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    删除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
