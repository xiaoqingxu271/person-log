'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DeletePostButton({ id, title }: { id: number; title: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`确定删除《${title}》？此操作不可恢复。`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
      else alert('删除失败，请重试')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {deleting ? '删除中…' : '删除'}
    </button>
  )
}
