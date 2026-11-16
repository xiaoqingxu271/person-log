/** 取出服务端错误编号（生产环境 error.message 会被隐藏，digest 用于对日志） */
export function errorDigest(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('digest' in error)) return undefined
  const digest = error.digest
  return typeof digest === 'string' ? digest : undefined
}
