'use client'

import { useCallback, useEffect, useState } from 'react'
import { MapPinIcon } from '@/components/icons'

type WeatherSource = 'gps' | 'ip'

interface WeatherNow {
  city: string
  temp: number
  feels: number
  humidity: number
  wind: number
  visibilityKm: number
  code: number
  source: WeatherSource
}

interface Coords {
  lat: number
  lon: number
}

const CACHE_KEY = 'pl-weather-v2'
const LEGACY_CACHE_KEY = 'pl-weather-v1'
const IP_TTL = 30 * 60 * 1000
const GPS_TTL = 60 * 60 * 1000
const TIMEOUT = 8000

/** 模块级缓存：同一页面多个天气组件只请求一次 */
let memo: { data: WeatherNow; at: number } | null = null

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal, cache: 'no-store' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

interface IpWhoResponse {
  success?: boolean
  latitude?: number
  longitude?: number
  city?: string
  region?: string
}

interface IpInfoResponse {
  loc?: string
  city?: string
}

interface GeoJsResponse {
  latitude?: string
  longitude?: string
}

interface ReverseGeoResponse {
  city?: string
  locality?: string
  principalSubdivision?: string
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
    visibility: number
  }
}

async function reverseGeocodeCity(lat: number, lon: number, signal: AbortSignal): Promise<string> {
  try {
    const data = await getJson<ReverseGeoResponse>(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`,
      signal,
    )
    return data.city || data.locality || data.principalSubdivision || ''
  } catch {
    return ''
  }
}

/**
 * IP 定位回退链：ipinfo 优先。
 * ipwho 对国内 IPv6（如 CERNET）的城市数据经常跑偏，只作后备。
 */
async function locateByIp(signal: AbortSignal): Promise<(Coords & { city: string }) | null> {
  try {
    const r = await getJson<IpInfoResponse>('https://ipinfo.io/json', signal)
    const [lat, lon] = String(r.loc ?? '').split(',').map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon, city: (await reverseGeocodeCity(lat, lon, signal)) || r.city || '' }
    }
  } catch {}

  try {
    const r = await getJson<IpWhoResponse>('https://ipwho.is/?lang=zh-CN', signal)
    if (r.success && typeof r.latitude === 'number' && typeof r.longitude === 'number') {
      return { lat: r.latitude, lon: r.longitude, city: r.city || r.region || '' }
    }
  } catch {}

  try {
    const r = await getJson<GeoJsResponse>('https://get.geojs.io/v1/ip/geo.json', signal)
    const lat = Number(r.latitude)
    const lon = Number(r.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon, city: await reverseGeocodeCity(lat, lon, signal) }
    }
  } catch {}

  return null
}

/** 浏览器精确定位（访客授权后可用，精度通常到街区） */
function getBrowserPosition(): Promise<Coords | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null)
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: TIMEOUT, maximumAge: 10 * 60 * 1000, enableHighAccuracy: false },
    )
  })
}

async function geoPermissionGranted(): Promise<boolean> {
  try {
    if (!navigator.permissions || !navigator.geolocation) return false
    const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
    return status.state === 'granted'
  } catch {
    return false
  }
}

async function fetchWeather(
  coords: Coords,
  city: string,
  source: WeatherSource,
  signal: AbortSignal,
): Promise<WeatherNow> {
  const params = new URLSearchParams({
    latitude: String(coords.lat),
    longitude: String(coords.lon),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,visibility',
    timezone: 'auto',
  })
  const data = await getJson<OpenMeteoResponse>(`https://api.open-meteo.com/v1/forecast?${params}`, signal)
  const c = data.current
  return {
    city,
    temp: Math.round(c.temperature_2m),
    feels: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    wind: Math.round(c.wind_speed_10m),
    visibilityKm: Math.round(c.visibility / 1000),
    code: c.weather_code,
    source,
  }
}

async function fetchIpWeather(signal: AbortSignal): Promise<WeatherNow> {
  const loc = await locateByIp(signal)
  if (!loc) throw new Error('定位失败')
  return fetchWeather(loc, loc.city, 'ip', signal)
}

async function fetchPreciseWeather(signal: AbortSignal): Promise<WeatherNow | null> {
  const coords = await getBrowserPosition()
  if (!coords) return null
  const city = await reverseGeocodeCity(coords.lat, coords.lon, signal)
  return fetchWeather(coords, city, 'gps', signal)
}

function ttlFor(data: WeatherNow) {
  return data.source === 'gps' ? GPS_TTL : IP_TTL
}

function readCache(): WeatherNow | null {
  if (memo && Date.now() - memo.at < ttlFor(memo.data)) return memo.data
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { t: number; data: WeatherNow }
    if (Date.now() - parsed.t >= ttlFor(parsed.data)) return null
    memo = { data: parsed.data, at: parsed.t }
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(data: WeatherNow) {
  const at = Date.now()
  memo = { data, at }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ t: at, data }))
  } catch {}
}

function useLocalWeather() {
  // 首屏用固定占位，挂载后再读缓存/请求，避免 SSR 与定位结果不一致
  const [weather, setWeather] = useState<WeatherNow | null>(null)
  const [failed, setFailed] = useState(false)
  const [preciseState, setPreciseState] = useState<'idle' | 'pending' | 'unavailable'>('idle')

  useEffect(() => {
    const ac = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined

    const start = <T,>(task: (signal: AbortSignal) => Promise<T>) => {
      timer = setTimeout(() => ac.abort(), TIMEOUT)
      return task(ac.signal).finally(() => {
        if (timer) clearTimeout(timer)
      })
    }

    const run = async () => {
      try {
        localStorage.removeItem(LEGACY_CACHE_KEY)
      } catch {}

      const cached = readCache()
      if (cached) setWeather(cached)

      // 已授权浏览器定位时静默升级为真实坐标，否则先展示 IP 定位结果
      if (await geoPermissionGranted()) {
        try {
          const data = await start(fetchPreciseWeather)
          if (data && !ac.signal.aborted) {
            setWeather(data)
            writeCache(data)
            return
          }
        } catch {}
      }
      if (cached || ac.signal.aborted) return

      try {
        const data = await start(fetchIpWeather)
        setWeather(data)
        writeCache(data)
      } catch {
        if (!ac.signal.aborted) setFailed(true)
      }
    }
    void run()

    return () => {
      if (timer) clearTimeout(timer)
      ac.abort()
    }
  }, [])

  // 用户点击「精确定位」：主动请求浏览器定位（会弹授权框）
  const locatePrecisely = useCallback(async () => {
    setPreciseState('pending')
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), TIMEOUT)
    try {
      const data = await fetchPreciseWeather(ac.signal)
      if (!data) {
        setPreciseState('unavailable')
        return
      }
      setWeather(data)
      writeCache(data)
      setFailed(false)
      setPreciseState('idle')
    } catch {
      setPreciseState('unavailable')
    } finally {
      clearTimeout(timer)
    }
  }, [])

  return { weather, failed, preciseState, locatePrecisely }
}

// ---- WMO 天气码 → 图标 / 文案 ----

type GlyphKind = 'sun' | 'partly' | 'cloud' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder'

const CODE_MAP: Record<number, { kind: GlyphKind; label: string }> = {
  0: { kind: 'sun', label: '晴' },
  1: { kind: 'partly', label: '晴间多云' },
  2: { kind: 'partly', label: '多云' },
  3: { kind: 'cloud', label: '阴' },
  45: { kind: 'fog', label: '雾' },
  48: { kind: 'fog', label: '雾凇' },
  51: { kind: 'drizzle', label: '毛毛雨' },
  53: { kind: 'drizzle', label: '毛毛雨' },
  55: { kind: 'drizzle', label: '浓毛毛雨' },
  56: { kind: 'drizzle', label: '冻毛毛雨' },
  57: { kind: 'drizzle', label: '冻毛毛雨' },
  61: { kind: 'rain', label: '小雨' },
  63: { kind: 'rain', label: '中雨' },
  65: { kind: 'rain', label: '大雨' },
  66: { kind: 'rain', label: '冻雨' },
  67: { kind: 'rain', label: '强冻雨' },
  71: { kind: 'snow', label: '小雪' },
  73: { kind: 'snow', label: '中雪' },
  75: { kind: 'snow', label: '大雪' },
  77: { kind: 'snow', label: '雪粒' },
  80: { kind: 'rain', label: '阵雨' },
  81: { kind: 'rain', label: '强阵雨' },
  82: { kind: 'rain', label: '暴雨' },
  85: { kind: 'snow', label: '阵雪' },
  86: { kind: 'snow', label: '强阵雪' },
  95: { kind: 'thunder', label: '雷阵雨' },
  96: { kind: 'thunder', label: '雷暴伴冰雹' },
  99: { kind: 'thunder', label: '强雷暴伴冰雹' },
}

function glyphFor(code: number): GlyphKind {
  return CODE_MAP[code]?.kind ?? 'cloud'
}

function labelFor(code: number): string {
  return CODE_MAP[code]?.label ?? '多云'
}

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
}

function WeatherGlyph({ code, className }: { code: number | null; className?: string }) {
  const kind = code === null ? 'cloud' : glyphFor(code)
  const sun = (
    <g>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </g>
  )
  const cloud = <path d="M7 18h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.1 9.2 4.4 4.4 0 0 0 7 18Z" />
  return (
    <svg {...svgProps} className={className} aria-hidden>
      {kind === 'sun' && sun}
      {kind === 'partly' && (
        <>
          <circle cx="9" cy="8.5" r="3" />
          <path d="M9 2.8v1.4M3.3 8.5H4.7M5 4.5l1 1" />
          {cloud}
        </>
      )}
      {kind === 'cloud' && cloud}
      {kind === 'fog' && (
        <>
          {cloud}
          <path d="M6 21h9M9 23h6" />
        </>
      )}
      {(kind === 'drizzle' || kind === 'rain') && (
        <>
          {cloud}
          <path d="M8.5 20v1.6M12 20v1.6M15.5 20v1.6" />
        </>
      )}
      {kind === 'snow' && (
        <>
          {cloud}
          <path d="M8.5 20.4v.1M12 21.6v.1M15.5 20.4v.1" strokeWidth={2.4} />
        </>
      )}
      {kind === 'thunder' && (
        <>
          {cloud}
          <path d="m12.5 19-1.6 2.6h2.4L11.6 24" />
        </>
      )}
    </svg>
  )
}

/** 首页 Hero 角标：当前访问者所在地的实时天气（点击可申请精确定位） */
export function LocalWeatherChip() {
  const { weather, failed, preciseState, locatePrecisely } = useLocalWeather()
  return (
    <button
      type="button"
      onClick={locatePrecisely}
      title="点击使用浏览器精确定位"
      className="glass-chip absolute right-0 top-1/2 flex w-[116px] -translate-y-1/2 flex-col items-center rounded-2xl px-3 py-3.5 text-center transition hover:bg-white/10"
    >
      <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-300">
        Weather
      </span>
      <span className="mt-1.5 flex items-center gap-1.5">
        <WeatherGlyph code={weather?.code ?? null} className="h-6 w-6 text-ice-300" />
        <span className="text-xl font-bold text-white">{weather ? `${weather.temp}°C` : '--°'}</span>
      </span>
      <span className="mt-1 max-w-full truncate text-[10px] text-slate-400">
        {preciseState === 'pending'
          ? '定位中…'
          : weather?.city || (failed ? '定位失败' : '定位中…')}
      </span>
    </button>
  )
}

/** 说说页侧栏天气卡：当前访问者所在地的实时天气 */
export function LocalWeatherCard() {
  const { weather, failed, preciseState, locatePrecisely } = useLocalWeather()
  const stats = weather
    ? [
        { value: `${weather.humidity}%`, label: '湿度' },
        { value: `${weather.wind}km/h`, label: '风速' },
        { value: `${weather.visibilityKm}km`, label: '能见度' },
      ]
    : [
        { value: '--', label: '湿度' },
        { value: '--', label: '风速' },
        { value: '--', label: '能见度' },
      ]

  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 text-xs text-slate-400">
        <span className="font-medium text-slate-200">此刻天气</span>
        <span className="truncate">{weather?.city || (failed ? '定位失败' : '正在定位…')}</span>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-ice-400/25 to-nebula-400/25 text-ice-200">
          <WeatherGlyph code={weather?.code ?? null} className="h-8 w-8" />
        </span>
        <div>
          <p className="text-3xl font-bold text-ice-300">{weather ? `${weather.temp}°C` : '--°C'}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {weather
              ? `${labelFor(weather.code)} · 体感 ${weather.feels}°C`
              : failed
                ? '暂时无法获取本地天气'
                : '正在获取本地天气…'}
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-3 text-center">
        {stats.map((item) => (
          <div key={item.label} className="px-1">
            <p className="text-sm font-semibold text-slate-200">{item.value}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
      {weather?.source !== 'gps' && (
        <button
          type="button"
          onClick={locatePrecisely}
          disabled={preciseState === 'pending'}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-1.5 text-[11px] text-slate-300 transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
        >
          <MapPinIcon className="h-3.5 w-3.5" />
          {preciseState === 'pending'
            ? '正在获取当前位置…'
            : preciseState === 'unavailable'
              ? '未获取到定位，允许浏览器定位后重试'
              : failed
                ? '重试定位'
                : '定位不准？使用浏览器精确定位'}
        </button>
      )}
    </section>
  )
}
