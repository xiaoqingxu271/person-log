import { cache } from 'react'
import { unstable_cache, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/db'
import { SITE } from '@/lib/site'

const SITE_CONFIG_TAG = 'site-config'

export interface SiteConfigValues {
  siteName: string
  tagline: string
  description: string
  footerText: string
  githubUrl: string
  email: string
  bannerUrl: string
  commentBannedWords: string
  commentAutoApproveEmails: string
  icpNumber: string
  icpUrl: string
}

const KEY_MAP: Record<keyof SiteConfigValues, string> = {
  siteName: 'site_name',
  tagline: 'site_tagline',
  description: 'site_description',
  footerText: 'footer_text',
  githubUrl: 'github_url',
  email: 'email',
  bannerUrl: 'banner_url',
  commentBannedWords: 'comment_banned_words',
  commentAutoApproveEmails: 'comment_auto_approve_emails',
  icpNumber: 'icp_number',
  icpUrl: 'icp_url',
}

function defaults(): SiteConfigValues {
  return {
    siteName: SITE.name,
    tagline: SITE.tagline,
    description: SITE.description,
    footerText: `© ${new Date().getFullYear()} ${SITE.name}`,
    githubUrl: '',
    email: '',
    bannerUrl: '',
    commentBannedWords: '',
    commentAutoApproveEmails: '',
    icpNumber: '',
    icpUrl: 'https://beian.miit.gov.cn/',
  }
}

/** 读取站点设置；留空的项回退到默认值，数据库不可用时也返回默认值 */
async function readSiteConfig(): Promise<SiteConfigValues> {
  try {
    const rows = await prisma.siteConfig.findMany()
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]))
    const out = defaults()
    for (const field of Object.keys(KEY_MAP) as (keyof SiteConfigValues)[]) {
      const value = map[KEY_MAP[field]]
      if (typeof value === 'string' && value.trim() !== '') out[field] = value.trim()
    }
    return out
  } catch {
    return defaults()
  }
}

/** 站点设置被布局、metadata 和页面同时读取；跨请求缓存并在保存后失效 */
export const getSiteConfig = cache(
  unstable_cache(readSiteConfig, ['site-config'], {
    tags: [SITE_CONFIG_TAG],
    revalidate: 300,
  }),
)

export interface OwnerProfile {
  displayName: string
  avatarUrl: string
}

/** 博主昵称/头像：每个前台页面都会用到，缓存避免逐请求查用户表 */
export const getOwnerProfile = cache(
  unstable_cache(
    async (): Promise<OwnerProfile | null> =>
      prisma.user
        .findFirst({ select: { displayName: true, avatarUrl: true } })
        .catch(() => null),
    ['owner-profile'],
    { tags: [SITE_CONFIG_TAG], revalidate: 300 },
  ),
)

export async function saveSiteConfig(values: Partial<Record<keyof SiteConfigValues, string>>) {
  const ops = Object.entries(values)
    .filter(([, v]) => typeof v === 'string')
    .map(([field, value]) =>
      prisma.siteConfig.upsert({
        where: { key: KEY_MAP[field as keyof SiteConfigValues] },
        update: { value: value as string },
        create: { key: KEY_MAP[field as keyof SiteConfigValues], value: value as string },
      }),
    )
  if (ops.length > 0) await prisma.$transaction(ops)
  revalidateTag(SITE_CONFIG_TAG, 'max')
}
