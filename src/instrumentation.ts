/**
 * 生产容器首次启动时，若用户表为空则按 ADMIN_USERNAME / ADMIN_PASSWORD 创建管理员，
 * 让 docker compose up 后可直接登录。已有账号时不会覆盖。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD
  if (!username || !password) return

  try {
    const [{ prisma }, { default: bcrypt }] = await Promise.all([
      import('./lib/db'),
      import('bcryptjs'),
    ])
    if ((await prisma.user.count()) > 0) return
    await prisma.user.create({
      data: {
        username,
        passwordHash: await bcrypt.hash(password, 10),
        displayName: username,
      },
    })
    console.log(`[bootstrap] 已创建初始管理员 ${username}，请登录后尽快修改默认密码`)
  } catch (error) {
    console.error('[bootstrap] 初始管理员创建失败（可手动执行 npm run db:seed）：', error)
  }
}
