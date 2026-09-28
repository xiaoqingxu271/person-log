import { readFile } from 'fs/promises'
import path from 'path'
import { MarkdownView } from '@/lib/markdown'
import { PageCard, PageHeader } from '@/components/page-card'

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
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader eyebrow="About" title="关于" />
        <MarkdownView content={content} />
      </PageCard>
    </div>
  )
}
