# Dockerfile para la API de apsicologia
FROM node:20-alpine

# Instalar pnpm y TypeScript globalmente
RUN npm install -g pnpm typescript

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del workspace
COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY packages/ ./packages/

# Copiar package.json de la API
COPY apps/api/package.json ./apps/api/

# Instalar dependencias
RUN pnpm install --no-frozen-lockfile

# Copiar código fuente de la API
COPY apps/api/ ./apps/api/

# Exponer puerto
EXPOSE 5000

# Comando para iniciar la aplicación en modo desarrollo
CMD ["pnpm", "--filter", "api", "dev"]