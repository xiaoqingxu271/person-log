# syntax=docker/dockerfile:1
# =====================================================================
# person-log 应用镜像（Next.js standalone 多阶段构建）
# =====================================================================

# ---------- 基础阶段 ----------
FROM node:22-alpine AS base
WORKDIR /app
# Prisma 查询引擎依赖 openssl；sharp / Next 在 Alpine 上需要 libc6-compat
RUN apk add --no-cache libc6-compat openssl

# ---------- 阶段 1：安装依赖 ----------
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---------- 阶段 2：构建 ----------
FROM base AS builder
# NEXT_PUBLIC_* 会在构建时内联进产物，由 compose build.args 传入
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_TELEMETRY_DISABLED=1 \
    BUILD_STANDALONE=1 \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
# Prisma 客户端必须按镜像平台生成；单独放前面，源码变动时可复用这层缓存
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# ---------- 阶段 3：运行 ----------
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    TZ=Asia/Shanghai \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 上传目录：命名卷挂载到这里，必须先建好并授权给运行用户
RUN mkdir -p /app/data/uploads && chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
