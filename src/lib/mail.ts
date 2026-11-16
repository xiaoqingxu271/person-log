import nodemailer, { type Transporter } from 'nodemailer'

interface MailConfig {
  host: string
  port: number
  secure: boolean
  user?: string
  pass?: string
  from: string
}

function getMailConfig(): MailConfig | null {
  const host = process.env.SMTP_HOST?.trim()
  const from = process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim()
  if (!host || !from) return null

  const rawPort = Number(process.env.SMTP_PORT ?? '587')
  const port = Number.isFinite(rawPort) ? rawPort : 587
  const secureEnv = process.env.SMTP_SECURE?.trim().toLowerCase()
  const secure = secureEnv ? secureEnv === 'true' || secureEnv === '1' : port === 465
  const user = process.env.SMTP_USER?.trim() || undefined
  const pass = process.env.SMTP_PASS ?? ''

  return { host, port, secure, user, pass: user ? pass : undefined, from }
}

export function isMailConfigured(): boolean {
  return getMailConfig() !== null
}

/** 博主通知收件地址：优先 MAIL_FROM，其次 SMTP_USER */
export function mailOwnerAddress(): string | null {
  return process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || null
}

let transporter: Transporter | null = null
let transporterKey = ''

function getTransporter(cfg: MailConfig): Transporter {
  const key = `${cfg.host}:${cfg.port}:${cfg.secure}:${cfg.user ?? ''}`
  if (transporter && transporterKey === key) return transporter
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass ?? '' } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })
  transporterKey = key
  return transporter
}

export interface MailMessage {
  to: string
  subject: string
  text: string
  html?: string
}

export type MailResult =
  | { ok: true }
  | { ok: false; skipped: 'not_configured' }
  | { ok: false; error: string }

/** 发送邮件；未配置 SMTP 时返回 skipped，由调用方静默跳过 */
export async function sendMail(message: MailMessage): Promise<MailResult> {
  const cfg = getMailConfig()
  if (!cfg) return { ok: false, skipped: 'not_configured' }

  try {
    await getTransporter(cfg).sendMail({
      from: cfg.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}
