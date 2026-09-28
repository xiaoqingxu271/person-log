'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SiteConfigValues } from '@/lib/site-config'

const FIELDS: { key: keyof SiteConfigValues; label: string; placeholder: string; hint?: string; textarea?: boolean }[] = [
  { key: 'siteName', label: '站点名称', placeholder: 'Person Log' },
  { key: 'tagline', label: '副标题', placeholder: '记录与思考' },
  { key: 'description', label: '站点描述（SEO）', placeholder: '个人博客：技术笔记与生活记录。' },
  { key: 'footerText', label: '页脚文案', placeholder: '© 2026 Person Log', hint: '留空的项恢复默认值' },
  { key: 'githubUrl', label: 'GitHub 主页（可选）', placeholder: 'https://github.com/yourname' },
  { key: 'email', label: '联系邮箱（可选）', placeholder: 'me@example.com' },
  {
    key: 'commentBannedWords',
    label: '评论黑名单关键词（用逗号分隔）',
    placeholder: '如 广告,代刷,博彩',
    hint: '昵称/邮箱/正文命中任一关键词的评论会被强制进入待审',
    textarea: true,
  },
  {
    key: 'commentAutoApproveEmails',
    label: '评论免审白名单邮箱（用逗号分隔）',
    placeholder: '如 friend@example.com',
    hint: '这些邮箱的评论无需审核直接展示',
    textarea: true,
  },
]

export function SettingsForm({ initial }: { initial: SiteConfigValues }) {
  const router = useRouter()
  const [values, setValues] = useState<SiteConfigValues>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? '保存失败，请重试')
        return
      }
      setSaved(true)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const input =
    'w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900'

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold">站点设置</h1>
      <div className="mt-6 space-y-5">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-300" htmlFor={field.key}>
              {field.label}
            </label>
            {field.textarea ? (
              <textarea
                id={field.key}
                className={`${input} h-20 resize-none`}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            ) : (
              <input
                id={field.key}
                className={input}
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
              />
            )}
            {field.hint && <p className="text-xs text-neutral-400">{field.hint}</p>}
          </div>
        ))}
        <div className="flex items-center gap-3 border-t border-neutral-100 pt-5 dark:border-neutral-800">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-neutral-900 px-5 py-2 text-sm text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            {saving ? '保存中…' : '保存设置'}
          </button>
          {saved && <span className="text-sm text-green-700 dark:text-green-500">已保存，前台刷新即可生效</span>}
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  )
}
