# person-log · 个人博客

个人博客网站，技术栈：**Next.js（App Router）+ MySQL 8 + Prisma + Tailwind CSS**。
需求分析与决策记录见 [需求文档.md](./需求文档.md)。

## 当前状态

- ✅ M1 已完成并冒烟验证通过（2026-09-28）：写 → 发 → 看闭环
  - 前台：首页列表、文章详情（Markdown + 代码高亮）、归档、分类、标签、关于页
  - 后台：登录、文章管理、编辑器（草稿/发布/置顶、自动建分类标签、本地草稿暂存）
  - SEO：每页独立标题/描述、Open Graph、`/sitemap.xml`、`/robots.txt`
- ✅ M2 已完成并冒烟验证通过（2026-09-28，21/21）：体验补全
  - 暗色模式（跟随系统 + 手动切换，首屏无闪烁，代码高亮同步切换）
  - 文章目录 TOC（宽屏侧栏 + 滚动高亮）、站内搜索（`/search`）、代码块复制按钮、图片懒加载
  - 站点设置（站点名/副标题/SEO 描述/页脚/社交链接/评论配置，实时生效）
  - 图片上传（粘贴/拖拽/按钮，存 `data/uploads/`，禁 svg 防 XSS）
  - 内容导出（后台一键下载全部文章为 front-matter Markdown zip）
- ✅ M3 已完成并冒烟验证通过（2026-09-28，26/26）：互动上线
  - 评论（完全自建）：游客免注册评论、楼中楼回复、Cravatar 头像、先审后显
  - 反垃圾四件套：蜜罐字段、最短提交耗时、同 IP 频率限制、黑名单关键词（后台可配）
  - 后台评论管理：待审角标、通过/隐藏/恢复/删除、以博主身份回复（免审直发）
  - 免审白名单邮箱（后台可配）、RSS 订阅 `/feed.xml`、浏览量统计、点赞（本地防重复）
- ⬜ M4 部署上线（暂缓）：域名/备案、服务器部署、HTTPS、备份脚本
- ⬜ M5 长期演进：数据看板、友链、时间线、结构化数据、评论邮件通知

## 快速开始（本地开发）

前置：Node 18+，以及可连接的 MySQL 8（本机安装或 Docker 均可）。

```bash
cp .env.example .env    # 按需修改 DATABASE_URL / 管理员账号
npm install
npm run db:push         # 建表（schema.prisma 是唯一事实来源）
npm run db:seed         # 管理员账号 + 示例文章（幂等，可重复执行）
npm run dev             # 开发模式，访问 http://localhost:3000
```

- 前台：<http://localhost:3000>
- 后台：<http://localhost:3000/admin>，初始账号 `admin / admin123456`（上线前务必改掉）
- 关于页内容：编辑 `content/about.md`

### 数据库两种连法

| 方式 | DATABASE_URL |
| --- | --- |
| 本机安装的 MySQL（默认 3306） | `mysql://personlog:personlog_pwd@localhost:3306/personlog` |
| Docker 里的 MySQL（宿主机端口映射为 3307） | `mysql://personlog:personlog_pwd@localhost:3307/personlog` |

数据库与账号需要提前创建：

```sql
CREATE DATABASE personlog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'personlog'@'localhost' IDENTIFIED BY 'personlog_pwd';
GRANT ALL PRIVILEGES ON personlog.* TO 'personlog'@'localhost';
```

## 冒烟测试

服务器运行中（`npm run dev` 或 `npm run start`）时执行，验证登录/发布/删除闭环：

```bash
node .smoke.mjs
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发模式 |
| `npm run build` / `npm run start` | 生产构建 / 运行 |
| `npm run db:push` | 同步 `prisma/schema.prisma` 到数据库 |
| `npm run db:seed` | 初始化管理员与示例文章 |
| `node .smoke.mjs` | 冒烟测试（需服务器运行中） |
| `node scripts/generate-hljs-dark.mjs` | 重新生成代码高亮暗色主题 |

上传的图片保存在 `data/uploads/`（已 gitignore），备份站点时记得一并备份该目录。

## Docker（部署用，暂未启用）

```bash
cp .env.example .env   # 服务器上部署时记得改默认密码
docker compose up -d --build
```

应用镜像要求 `next.config.ts` 开启 `output: "standalone"`；MySQL 容器首次启动会
自动执行 `docker/mysql/init/01-init.sql`（由 Prisma schema 生成，仅数据卷为空时执行）。

## 数据备份

```bash
docker exec person-log-mysql sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > backup.sql
```
