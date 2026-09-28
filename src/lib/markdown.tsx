import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import { CodeBlock } from '@/components/code-block'

// 放行 className（hljs-* 高亮与 language-* 语言标注）；保留 id 供 TOC 锚点跳转。
// 文章内容仅博主本人可写，消毒主要作为兜底防线。
const sanitizeSchema = {
  ...defaultSchema,
  clobber: [],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
  },
}

/** Markdown 渲染组件：前后台通用（GFM + 标题锚点 + 代码高亮 + 消毒 + 图片懒加载） */
export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeHighlight, [rehypeSanitize, sanitizeSchema]]}
        components={{
          pre: ({ node: _node, ...rest }) => <CodeBlock {...rest} />,
          img: ({ node: _node, alt = '', ...rest }) => <img alt={alt} loading="lazy" decoding="async" {...rest} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
