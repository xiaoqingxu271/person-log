import { listMoments } from '@/lib/moments'
import { formatDate } from '@/lib/format'
import { PageCard, PageHeader } from '@/components/page-card'
import { PenLineIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '说说' }

export default async function MomentsPage() {
  const moments = await listMoments()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader
          eyebrow="Moments"
          title="说说"
          description={`共 ${moments.length} 条，随手记录的碎碎念`}
        />
        {moments.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">还没有发布过说说。</p>
        ) : (
          <div className="ml-2 border-l border-stone-200 dark:border-stone-800">
            {moments.map((moment) => (
              <section key={moment.id} className="relative pb-8 pl-8 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-orange-500 dark:border-stone-900"
                />
                <p className="whitespace-pre-line break-words text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                  {moment.content}
                </p>
                {moment.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={moment.imageUrl}
                    alt=""
                    loading="lazy"
                    className="mt-3 max-h-96 rounded-2xl border border-stone-100 object-cover dark:border-stone-800"
                  />
                )}
                <p className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
                  <PenLineIcon className="h-3 w-3" />
                  <time dateTime={moment.createdAt.toISOString()}>{formatDate(moment.createdAt)}</time>
                </p>
              </section>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
