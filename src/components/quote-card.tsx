import Image from 'next/image'
import { ConstellationBird } from '@/components/constellation-bird'

const QUOTES = [
  { zh: '愿你在光中，找到前行的方向。', en: 'May you find your way in the light.' },
  { zh: '极光是夜空写给大地的情书。', en: 'The aurora is a love letter from the night sky.' },
  { zh: '追光的人，终会身披万丈光芒。', en: 'Those who chase the light will be clothed in it.' },
  { zh: '把日子过成星野，抬头便是极光。', en: 'Live your days like a starfield; look up, there is the aurora.' },
  { zh: '山不过来，我便向山走去。', en: 'If the mountain will not come, I will go to the mountain.' },
]

/** 极光之语：每日一句手写语录 + 星座飞鸟 + 极光照片 */
export function QuoteCard() {
  const now = new Date()
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  )
  const quote = QUOTES[dayOfYear % QUOTES.length]

  return (
    <section className="glass-panel rounded-3xl p-6">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="h-4 w-1 rounded-full bg-gradient-to-b from-ice-400 to-nebula-500" />
        <h3 className="text-base font-semibold text-white">极光之语</h3>
      </div>

      <div className="relative mt-4">
        <p className="font-brush text-glow pr-20 text-[22px] leading-relaxed text-white">
          {quote.zh}
        </p>
        <div className="animate-float absolute -top-3 right-0">
          <ConstellationBird className="h-24 w-24" />
        </div>
      </div>
      <p className="font-display mt-2 text-xs italic text-slate-400">{quote.en}</p>

      <div className="relative mt-4 h-28 overflow-hidden rounded-xl">
        <Image
          src="/images/aurora-cabin.jpg"
          alt="极光下亮着灯的小屋"
          fill
          sizes="(max-width: 1024px) 100vw, 340px"
          className="object-cover transition-transform duration-700 hover:scale-[1.05]"
        />
      </div>
    </section>
  )
}