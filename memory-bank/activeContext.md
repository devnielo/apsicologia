# Contexto Activo - apsicologia

## Estado Actual del Proyecto
**Fecha:** 14/8/2025
**Fase:** Inicialización y configuración del proyecto

## Trabajo Reciente Completado
1. ✅ Creación de la estructura del Memory Bank
2. ✅ Documentación completa del proyecto (brief, producto, patrones, tecnología)
3. ✅ Definición de arquitectura y stack tecnológico
4. ✅ Especificación de patrones de desarrollo y seguridad

## Foco de Trabajo Actual
**Inicialización del Monorepo**
- Configuración de pnpm workspaces
- Estructura de carpetas del monorepo
- Configuración base de TypeScript y herramientas de desarrollo
- Setup de Docker Compose para servicios

## Próximos Pasos Inmediatos

### 1. Setup del Monorepo (En curso)
- [ ] Crear estructura de carpetas (`apps/`, `packages/`)
- [ ] Configurar `package.json` principal con workspaces
- [ ] Setup de TypeScript configuration compartida
- [ ] Configuración de ESLint/Prettier

### 2. Backend Core (Siguiente)
- [ ] Configurar Express API en `apps/api`
- [ ] Setup de MongoDB con Mongoose schemas
- [ ] Implementar sistema de autenticación JWT
- [ ] Configurar Redis y BullMQ

### 3. Frontend Core (Después)
- [ ] Setup de Next.js en `apps/web`
- [ ] Configurar TailwindCSS con paleta OKLCH
- [ ] Implementar shadcn/ui base
- [ ] Setup de TanStack Query

### 4. Docker Environment
- [ ] Crear docker-compose.yml con todos los servicios
- [ ] Configurar variables de entorno
- [ ] Scripts de desarrollo y producción

## Decisiones Técnicas Activas

### Estructura del Monorepo
```
arribap/
├── apps/
│   ├── web/           # Next.js frontend
│   ├── api/           # Express API
│   └── docs/          # Documentación MDX
├── packages/
│   ├── shared/        # Tipos compartidos, validaciones Zod
│   ├── ui/            # Componentes shadcn/ui
│   ├── emails/        # Plantillas React Email
│   └── config/        # Configuraciones compartidas
├── docker/            # Configuraciones Docker
└── scripts/           # Scripts de utilidad
```

### Tecnologías Confirmadas
- **Monorepo:** pnpm workspaces (elegido por simplicidad vs Turborepo)
- **Backend:** Express + MongoDB + Redis + BullMQ
- **Frontend:** Next.js 14 App Router + shadcn/ui
- **Calendario:** FullCalendar (más features que React Big Calendar)
- **Forms:** react-jsonschema-form (para cuestionarios dinámicos)

### Paleta de Colores OKLCH
- Primary: `oklch(76.8% 0.12 15.2)` - Color principal cálido
- Secondary: `oklch(58.5% 0.08 25)` - Complementario neutro
- Accent: `oklch(70% 0.12 220)` - Azul/teal amigable
- Success: `oklch(72% 0.12 150)` - Verde éxito
- Warning: `oklch(83% 0.14 80)` - Amarillo advertencia
- Danger: `oklch(62% 0.18 25)` - Rojo peligro

## Consideraciones Activas

### Arquitectura
- **Monolito modulares:** APIs separadas por dominio pero en mismo proceso
- **Database:** Single MongoDB instance con collections por entidad
- **Caching:** Redis para sessions, slots calculados, y datos frecuentes
- **Files:** MinIO para storage autoalojado

### Seguridad
- **RGPD compliance:** Desde el primer día con audit logs
- **Authentication:** JWT con refresh tokens, 2FA opcional
- **Authorization:** RBAC granular por módulo
- **Data protection:** Encryp sensitive fields, secure headers

### Performance
- **Frontend:** SSR para pages públicas, SPA para dashboard
- **Caching:** Aggressive caching con invalidación inteligente
- **Database:** Proper indexing desde el diseño inicial
- **Images:** Next.js optimization + CDN ready

## Riesgos y Mitigaciones

### Riesgo: Complejidad del calendario
- **Mitigación:** Usar FullCalendar probado, implementar slots step by step
- **Plan B:** React Big Calendar si FullCalendar es demasiado complejo

### Riesgo: Integración Jitsi
- **Mitigación:** Empezar con Jitsi SaaS gratuito, migrar a self-hosted después
- **Plan B:** Enlaces simples de videollamada hasta implementar Jitsi

### Riesgo: Performance con muchos usuarios
- **Mitigación:** Redis caching desde el inicio, database indexing
- **Monitoring:** Health checks y métricas desde día uno

## Herramientas de Desarrollo

### Configuraciones Pendientes
- [ ] Prettier config compartida
- [ ] ESLint rules específicas para el proyecto
- [ ] Husky pre-commit hooks
- [ ] GitHub Actions para CI/CD
- [ ] Jest setup para testing

### Scripts de Desarrollo
- [ ] `dev`: Arrancar todos los servicios en desarrollo
- [ ] `build`: Build completo del monorepo
- [ ] `test`: Run all tests
- [ ] `db:seed`: Populate con datos de desarrollo
