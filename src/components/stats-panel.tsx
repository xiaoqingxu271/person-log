import { formatCount } from '@/lib/format'
import { FileTextIcon, FolderIcon, TagIcon, UsersIcon } from '@/components/icons'
import { TrendChart, type PvPoint } from '@/components/trend-chart'

interface StatsPanelProps {
  stats: { posts: number; categories: number; tags: number; views: number }
  series: PvPoint[]
}

/** 站点统计 2x2 + 访问趋势折线图 */
export function StatsPanel({ stats, series }: StatsPanelProps) {
  const items = [
    { label: '文章总数', value: String(stats.posts), icon: FileTextIcon, color: 'text-aurora-300' },
    { label: '分类总数', value: String(stats.categories), icon: FolderIcon, color: 'text-ice-300' },
    { label: '标签总数', value: String(stats.tags), icon: TagIcon, color: 'text-nebula-300' },
    { label: '访问总量', value: formatCount(stats.views), icon: UsersIcon, color: 'text-flare-300' },
  ]

  return (
    <section className="glass-panel rounded-3xl p-6">
      <h3 className="text-base font-semibold text-white">站点统计</h3>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span
              className={`glass-chip flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-slate-400">{item.label}</span>
              <span className="block truncate text-xl font-bold text-white">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="my-5 border-t border-white/10" />
      <TrendChart series={series} />
    </section>
  )
}