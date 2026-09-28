'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function MomentDeleteButton({ id }: { id: number }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (!confirm('确定删除这条说说？')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/moments?id=${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
      else alert('删除失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="text-xs text-red-600 transition-colors hover:underline disabled:opacity-50 dark:text-red-500"
    >
      {busy ? '删除中…' : '删除'}
    </button>
  )
}
