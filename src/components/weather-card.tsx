import { CloudSnowIcon } from '@/components/icons'

/** 装饰天气 widget（与首页 Hero 天气同源设定：冰岛观测站） */
export function WeatherCard() {
  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium text-slate-200">此刻天气</span>
        <span>冰岛 · 雷克雅未克</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-ice-400/25 to-nebula-400/25 text-ice-200">
          <CloudSnowIcon className="h-8 w-8" />
        </span>
        <div>
          <p className="text-3xl font-bold text-ice-300">-2°C</p>
          <p className="mt-0.5 text-xs text-slate-400">晴朗 · 体感 -5°C</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-3 text-center">
        {[
          { value: '68%', label: '湿度' },
          { value: '12km/h', label: '风速' },
          { value: '10km', label: '能见度' },
        ].map((item) => (
          <div key={item.label} className="px-1">
            <p className="text-sm font-semibold text-slate-200">{item.value}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}