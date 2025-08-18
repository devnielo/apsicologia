# Dockerfile para la aplicación web Next.js de apsicologia
FROM node:20-alpine AS base

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del workspace
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY packages/ ./packages/

# Copiar package.json de la web
COPY apps/web/package.json ./apps/web/

# Instalar dependencias
RUN pnpm install --no-frozen-lockfile

# Copiar código fuente de la web
COPY apps/web/ ./apps/web/

# Build stage
FROM base AS builder
WORKDIR /app
RUN cd apps/web && pnpm build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar archivos necesarios
COPY --from=builder /app/apps/web/next.config.js ./
COPY --from=builder /app/apps/web/package.json ./
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]