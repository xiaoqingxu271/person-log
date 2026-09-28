import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import { visit } from 'unist-util-visit'
import type { Element } from 'hast'

export interface TocItem {
  id: string
  text: string
  level: number
}

/**
 * 提取文章目录（h2/h3）。
 * 与 MarkdownView 使用相同的 remark/rehype 插件链（rehype-slug），
 * 保证这里拿到的 id 与正文渲染出的 heading id 一致。
 */
export async function extractToc(markdown: string): Promise<TocItem[]> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
  const tree = await processor.run(processor.parse(markdown))

  const items: TocItem[] = []
  visit(tree, 'element', (node: Element) => {
    const match = node.tagName.match(/^h([1-3])$/)
    if (!match) return
    const id = node.properties?.id
    if (typeof id !== 'string') return
    const text = textOf(node).trim()
    if (text) items.push({ id, text, level: Number(match[1]) })
  })
  return items.filter((item) => item.level >= 2)
}

function textOf(node: Element): string {
  let text = ''
  visit(node, (n) => {
    if (n.type === 'text') text += (n as { value: string }).value
  })
  return text
}
