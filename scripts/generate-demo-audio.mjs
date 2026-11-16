// 生成音乐库演示音频（原创合成氛围曲，免版权，幂等覆盖）
// 运行：node scripts/generate-demo-audio.mjs
// 说明：纯 Node 加法合成（pad/pluck/bell 音色 + 和弦进行 + 琶音 + 回声），
//       每首约 22 秒、22050Hz 单声道 WAV，输出到 public/audio/。
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const SR = 22050

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  majPent: [0, 2, 4, 7, 9],
  minPent: [0, 3, 5, 7, 10],
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12)

function scaleAt(scale, idx) {
  const oct = Math.floor(idx / scale.length)
  const deg = ((idx % scale.length) + scale.length) % scale.length
  return scale[deg] + 12 * oct
}

function renderNote(buf, start, dur, freq, timbre, gain, rng) {
  const s0 = Math.floor(start * SR)
  const sN = Math.floor(dur * SR)
  const detune = 1 + (rng() - 0.5) * 0.004
  for (let i = 0; i < sN; i++) {
    const idx = s0 + i
    if (idx >= buf.length) break
    const t = i / SR
    let env
    if (timbre === 'pad') {
      const atk = 0.7
      const rel = Math.min(1.4, dur * 0.45)
      const e = t < atk ? t / atk : t > dur - rel ? Math.max(0, (dur - t) / rel) : 1
      env = e * e * (3 - 2 * e)
    } else {
      const tau = timbre === 'bell' ? 1.7 : 0.95
      env = Math.exp(-t / tau) * Math.min(1, t / 0.006)
    }
    const w = 2 * Math.PI * freq * t
    let s
    if (timbre === 'pad') {
      s = Math.sin(w) + 0.4 * Math.sin(2 * w * detune) + 0.16 * Math.sin(3 * w)
    } else if (timbre === 'bell') {
      s = Math.sin(w) + 0.5 * Math.sin(2.76 * w) * Math.exp(-t / 0.8) + 0.22 * Math.sin(5.4 * w) * Math.exp(-t / 0.4)
    } else {
      s = Math.sin(w) + 0.3 * Math.sin(2 * w) + 0.13 * Math.sin(3 * w) + 0.06 * Math.sin(4 * w)
    }
    buf[idx] += s * env * gain
  }
}

function addDelay(buf, time, gain) {
  const d = Math.floor(time * SR)
  for (let i = d; i < buf.length; i++) buf[i] += buf[i - d] * gain
}

function compose(cfg) {
  const dur = cfg.dur ?? 22
  const buf = new Float32Array(Math.floor(SR * dur))
  const rng = mulberry32(cfg.seed)
  const scale = SCALES[cfg.scale]
  const chordDur = dur / cfg.prog.length

  cfg.prog.forEach((deg, ci) => {
    const t0 = ci * chordDur
    const chord = [0, 2, 4, 7].map((step) => midiToFreq(cfg.root + scaleAt(scale, deg + step)))
    chord.forEach((f, k) => renderNote(buf, t0, chordDur + 1.0, f, 'pad', 0.15 / (1 + k * 0.35), rng))
    const step = cfg.tempo
    for (let t = t0 + 0.15; t < t0 + chordDur - 0.2; t += step) {
      if (rng() < cfg.density) {
        const note = chord[Math.floor(rng() * chord.length)] * (rng() < 0.25 ? 2 : 1)
        renderNote(buf, t, step * 2.4, note, cfg.timbre, 0.2, rng)
      }
    }
  })

  addDelay(buf, 0.3, 0.26)
  addDelay(buf, 0.45, 0.16)

  let peak = 0
  for (const s of buf) peak = Math.max(peak, Math.abs(s))
  const norm = 0.82 / (peak || 1)
  const fadeIn = Math.floor(0.4 * SR)
  const fadeOut = Math.floor(2.5 * SR)
  for (let i = 0; i < buf.length; i++) {
    let g = norm
    if (i < fadeIn) g *= i / fadeIn
    if (i > buf.length - fadeOut) g *= Math.max(0, (buf.length - i) / fadeOut)
    buf[i] *= g
  }
  return buf
}

function wavBuffer(samples) {
  const n = samples.length
  const b = Buffer.alloc(44 + n * 2)
  b.write('RIFF', 0)
  b.writeUInt32LE(36 + n * 2, 4)
  b.write('WAVE', 8)
  b.write('fmt ', 12)
  b.writeUInt32LE(16, 16)
  b.writeUInt16LE(1, 20)
  b.writeUInt16LE(1, 22)
  b.writeUInt32LE(SR, 24)
  b.writeUInt32LE(SR * 2, 28)
  b.writeUInt16LE(2, 32)
  b.writeUInt16LE(16, 34)
  b.write('data', 36)
  b.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    b.writeInt16LE(Math.round(s * 32767), 44 + i * 2)
  }
  return b
}

const TRACKS = [
  { name: 'orbit', root: 50, scale: 'minPent', prog: [0, 3, 4, 2], tempo: 0.62, timbre: 'bell', density: 0.5, seed: 11, dur: 23 },
  { name: 'async', root: 57, scale: 'minor', prog: [0, 5, 3, 4], tempo: 0.9, timbre: 'bell', density: 0.42, seed: 22, dur: 22 },
  { name: 'folklore', root: 55, scale: 'major', prog: [0, 4, 5, 3], tempo: 0.5, timbre: 'pluck', density: 0.7, seed: 33, dur: 22 },
  { name: 'mountain-road', root: 52, scale: 'minor', prog: [0, 3, 4, 6], tempo: 0.8, timbre: 'pluck', density: 0.45, seed: 44, dur: 24 },
  { name: 'peace', root: 60, scale: 'major', prog: [0, 3, 4, 4], tempo: 0.7, timbre: 'pluck', density: 0.55, seed: 55, dur: 22 },
  { name: 'in-rainbows', root: 59, scale: 'minor', prog: [0, 5, 2, 4], tempo: 0.42, timbre: 'pluck', density: 0.72, seed: 66, dur: 22 },
  { name: 'adventure', root: 62, scale: 'majPent', prog: [0, 2, 3, 1], tempo: 0.4, timbre: 'pluck', density: 0.78, seed: 77, dur: 21 },
  { name: 'fantasy', root: 65, scale: 'majPent', prog: [0, 3, 1, 2], tempo: 0.34, timbre: 'pluck', density: 0.82, seed: 88, dur: 21 },
]

async function main() {
  const dir = path.join(process.cwd(), 'public', 'audio')
  await mkdir(dir, { recursive: true })
  for (const t of TRACKS) {
    const buf = compose(t)
    const out = path.join(dir, `${t.name}.wav`)
    await writeFile(out, wavBuffer(buf))
    console.log(`${t.name}.wav  ${(buf.length / SR).toFixed(1)}s  ${Math.round((44 + buf.length * 2) / 1024)}KB`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})