import { readFile } from 'fs/promises'
import path from 'path'
import { MarkdownView } from '@/lib/markdown'

export const dynamic = 'force-dynamic'

export const metadata = { title: '关于' }

async function loadAbout() {
  try {
    return await readFile(path.join(process.cwd(), 'content', 'about.md'), 'utf8')
  } catch {
    return '关于页内容待补充：编辑项目根目录的 `content/about.md`，本页会随之更新。'
  }
}

export default async function AboutPage() {
  const content = await loadAbout()
  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">关于</h1>
      <MarkdownView content={content} />
    </div>
  )
}
