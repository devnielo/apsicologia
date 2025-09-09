# Proyecto apsicologia - Plataforma de Gestión Psicológica

## Descripción del Proyecto
Plataforma integral autoalojada para la empresa privada "apsicologia" que replica y mejora las funcionalidades de eHolo (calendario, pacientes, facturación, pagos, cuestionarios, transcripciones, notas, archivos, despachos/salas, agenda pública, centro & profesionales, configuración, estadísticas).

## Stack Tecnológico

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express (API REST)
- **Base de datos:** MongoDB con Mongoose
- **Cache/Jobs:** Redis + BullMQ (colas)
- **Email:** Nodemailer
- **Logging:** pino
- **Validación:** Zod

### Frontend
- **Framework:** Next.js 14 (App Router) + React 18
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS
- **Componentes:** shadcn/ui (sobre Radix UI)
- **Iconos:** lucide-react
- **Data Fetching:** TanStack Query
- **Formularios:** React Hook Form + Zod resolver
- **Email Templates:** React Email

### Herramientas Especializadas
- **Calendario:** FullCalendar core (timegrid/interaction) o React Big Calendar
- **Gráficas:** Recharts
- **Editor:** Tiptap
- **Formularios dinámicos:** react-jsonschema-form
- **Archivos:** Cloudflare R2 (S3-compatible)
- **Videollamadas:** Jitsi Meet (self-hosted)
- **i18n:** next-intl (ES por defecto)
- **Fechas:** date-fns + date-fns-tz
- **ICS:** ical-generator

## Diseño y UI

### Marca
- **Nombre:** apsicologia
- **Color primario:** oklch(76.8% 0.12 15.2)

### Paleta de colores (variables Tailwind CSS)
- `--color-primary`: oklch(76.8% 0.12 15.2)
- `--color-secondary`: oklch(58.5% 0.08 25)
- `--color-accent`: oklch(70% 0.12 220)
- `--color-success`: oklch(72% 0.12 150)
- `--color-warning`: oklch(83% 0.14 80)
- `--color-danger`: oklch(62% 0.18 25)
- `--bg`: oklch(98% 0 0)
- `--fg`: oklch(21% 0 0)
- `--muted`: oklch(94% 0.02 260)

### Principios de diseño
- Limpio y accesible (WCAG AA)
- Cercano y profesional
- Uso de lucide icons
- Fotos open-source (Unsplash/Pexels)

## Roles y Permisos
- **Admin:** Acceso total a la plataforma
- **Profesional:** Su agenda, pacientes asignados, notas, cuestionarios, facturación propia
- **Recepción:** Agenda, facturación, pacientes (sin notas clínicas)
- **Paciente:** Portal personal, reservas, pagos, formularios, descargas

## Infraestructura
- **Contenedores:** Docker Compose (api, web, mongo, redis, jitsi opcional, nginx)
- **Configuración:** dotenv para secretos
- **Proxy:** Nginx reverse proxy con HTTPS
- **Analítica:** Plausible (self-hosted)

## Testing y Calidad
- **Unit Testing:** Jest
- **E2E Testing:** Playwright
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode

## Licencias y Dependencias
- Solo dependencias open-source/gratuitas
- Todas las librerías bajo licencias MIT o similares
