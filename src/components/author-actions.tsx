'use client'

/** 作者卡操作：关注→定位到页脚订阅；私信→邮件 */
export function AuthorActions({ email }: { email: string }) {
  function follow() {
    const input = document.querySelector<HTMLInputElement>('footer input')
    if (input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => input.focus({ preventScroll: true }), 450)
    }
  }

  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={follow}
        title="订阅博客更新"
        className="aurora-btn rounded-full py-2 text-sm font-medium"
      >
        关注
      </button>
      <a
        href={email ? `mailto:${email}` : '/about'}
        title={email ? `发邮件给博主` : '关于博主'}
        className="glass-chip rounded-full py-2 text-center text-sm text-slate-200 transition-colors hover:border-ice-400/40 hover:text-ice-300"
      >
        私信
      </a>
    </div>
  )
}