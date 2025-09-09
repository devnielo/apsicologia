# 🩺 apsicologia Platform

Una plataforma completa de gestión para centros de psicología, desarrollada con tecnologías modernas y enfoque en la usabilidad y seguridad.

## 🎯 Descripción

apsicologia es una plataforma autoalojada para la gestión integral de consultorios y centros de psicología que incluye:

- **Gestión de pacientes** con historial clínico completo
- **Agenda y citas** con calendario interactivo
- **Sistema de facturación** y pagos
- **Cuestionarios dinámicos** para evaluaciones
- **Notas clínicas** con editor avanzado
- **Videoconsultas** integradas con Jitsi Meet
- **Panel de estadísticas** y reportes
- **Sistema de roles** (Admin, Profesional, Recepción, Paciente)

## 🚀 Estado Actual del Proyecto

**✅ BACKEND API COMPLETAMENTE FUNCIONAL (100%)**

- 13 endpoints API REST operativos
- Sistema de autenticación JWT con refresh tokens
- Base de datos MongoDB poblada con datos de prueba
- Sistema de roles y permisos (RBAC)
- Validación completa de entrada
- Logging estructurado y audit trails

## 🏗️ Arquitectura Técnica

### Backend
- **Node.js 20** + **Express.js** (API REST)
- **TypeScript** para tipado estricto
- **MongoDB** con **Mongoose** (base de datos)
- **Redis** (cache y sessiones)
- **JWT** (autenticación)
- **pino** (logging estructurado)
- **express-validator** (validación)

### Frontend (Próximamente)
- **Next.js 14** (App Router) + **React 18**
- **TailwindCSS** + **shadcn/ui** (diseño)
- **TanStack Query** (server state)
- **React Hook Form** + **Zod** (formularios)

### Servicios Externos
- **Cloudflare R2** (almacenamiento de archivos S3-compatible)
- **Jitsi Meet** (videoconsultas)
- **SMTP** (envío de emails)

### Infraestructura
- **Docker Compose** para desarrollo
- **pnpm workspaces** (monorepo)

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js 20+**
- **Docker & Docker Compose**
- **pnpm** (recomendado) o npm

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/devnielo/apsicologia.git
cd apsicologia
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar variables de entorno**
```bash
# Copiar archivo de ejemplo
cp apps/api/.env.example apps/api/.env

# Editar las variables según tu entorno
nano apps/api/.env
```

4. **Iniciar servicios con Docker**
```bash
docker-compose up -d
```

5. **Crear usuario administrador**
```bash
cd apps/api
node create-admin-simple.js
```

6. **Poblar base de datos con datos de prueba**
```bash
node seed-simple.cjs
```

7. **Iniciar servidor de desarrollo**
```bash
pnpm dev
```

La API estará disponible en: http://localhost:3001

## 🔐 Credenciales de Prueba

```
👤 Admin: admin@arribapsicologia.com / SecureAdmin2024!
👨‍⚕️ Professional 1: maria.garcia@arribapsicologia.com / Professional2024!
👨‍⚕️ Professional 2: carlos.rodriguez@arribapsicologia.com / Professional2024!
🏥 Patient 1: ana.martinez@email.com / Patient2024!
🏥 Patient 2: miguel.fernandez@email.com / Patient2024!
```

## 📋 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/logout` - Cerrar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/auth/me` - Información del usuario actual

### Gestión de Entidades
- `GET|POST|PUT|DELETE /api/v1/users` - Usuarios del sistema
- `GET|POST|PUT|DELETE /api/v1/patients` - Pacientes
- `GET|POST|PUT|DELETE /api/v1/professionals` - Profesionales
- `GET|POST|PUT|DELETE /api/v1/services` - Servicios ofrecidos
- `GET|POST|PUT|DELETE /api/v1/rooms` - Salas (físicas y virtuales)
- `GET|POST|PUT|DELETE /api/v1/appointments` - Citas médicas

### Facturación y Pagos
- `GET|POST|PUT /api/v1/invoices` - Facturas
- `GET|POST|PUT /api/v1/payments` - Pagos

### Funcionalidades Clínicas
- `GET|POST|PUT|DELETE /api/v1/forms` - Cuestionarios dinámicos
- `GET|POST|PUT|DELETE /api/v1/notes` - Notas clínicas
- `GET|POST|DELETE /api/v1/files` - Gestión de archivos

### Estadísticas
- `GET /api/v1/stats` - Panel de estadísticas y métricas

## 🗂️ Estructura del Proyecto

```
apsicologia/
├── apps/
│   ├── api/                 # Backend Express.js
│   │   ├── src/
│   │   │   ├── controllers/ # Lógica de negocio
│   │   │   ├── models/      # Mongoose schemas
│   │   │   ├── routes/      # Definición de rutas
│   │   │   ├── middleware/  # Middleware personalizado
│   │   │   ├── config/      # Configuración
│   │   │   ├── scripts/     # Scripts de utilidad
│   │   │   └── utils/       # Utilidades
│   │   └── seed-simple.cjs  # Script de datos semilla
│   └── web/                 # Frontend Next.js (próximamente)
├── packages/
│   └── shared/              # Código compartido
│       ├── src/types/       # TypeScript types
│       ├── src/utils/       # Utilidades compartidas
│       └── src/validations/ # Validaciones Zod
├── memory-bank/             # Documentación del progreso
├── docker-compose.yml       # Servicios Docker
└── README.md               # Este archivo
```

## 🔧 Servicios Docker

El proyecto utiliza Docker Compose para gestionar los siguientes servicios:

- **apsicologia-api**: Servidor Express.js (Puerto 3001)
- **apsicologia-mongodb**: Base de datos MongoDB (Puerto 27017)
- **apsicologia-redis**: Cache Redis (Puerto 6379)

### Comandos útiles

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs de un servicio específico
docker-compose logs -f apsicologia-api

# Reiniciar un servicio
docker-compose restart apsicologia-api

# Parar todos los servicios
docker-compose down

# Limpiar volúmenes (¡CUIDADO! Elimina datos)
docker-compose down -v
```

## 🧪 Testing y Desarrollo

### Probar la API

```bash
# Login como admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@arribapsicologia.com", "password": "SecureAdmin2024!"}'

# Obtener token y probar endpoint (reemplaza TOKEN)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/v1/patients
```

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor en modo desarrollo
pnpm build           # Construye el proyecto para producción
pnpm start           # Inicia servidor en modo producción

# Base de datos
node create-admin-simple.js  # Crear usuario admin
node seed-simple.cjs        # Poblar datos de prueba

# Linting y formato
pnpm lint            # Ejecutar ESLint
pnpm format          # Formatear código con Prettier
```

## 🎨 Diseño y UI

### Paleta de Colores (OKLCH)

```css
--color-primary: oklch(76.8% 0.12 15.2);     /* Cálido principal */
--color-secondary: oklch(58.5% 0.08 25);     /* Neutro complementario */
--color-accent: oklch(70% 0.12 220);         /* Azul/teal amigable */
--color-success: oklch(72% 0.12 150);        /* Verde éxito */
--color-warning: oklch(83% 0.14 80);         /* Amarillo advertencia */
--color-danger: oklch(62% 0.18 25);          /* Rojo peligro */
--bg: oklch(98% 0 0);                        /* Fondo claro */
--fg: oklch(21% 0 0);                        /* Texto oscuro */
--muted: oklch(94% 0.02 260);                /* Neutro suave */
```

## 🛡️ Seguridad y Cumplimiento

### Características de Seguridad
- **Autenticación JWT** con refresh tokens
- **Sistema RBAC** granular por roles
- **Validación de entrada** en todos los endpoints
- **Rate limiting** por IP y usuario
- **Audit logs** completos para trazabilidad
- **Encriptación de contraseñas** con bcrypt

### Cumplimiento RGPD
- **Registro de consentimientos** con timestamps
- **Derecho al olvido** con soft delete
- **Exportación de datos** del usuario
- **Logs de auditoría** para compliance
- **Anonimización** automática de datos

## 📈 Datos de Ejemplo

El sistema incluye datos semilla realistas:

### Profesionales
- **Dr. María García López**: Especialista en TCC, Ansiedad, Depresión
- **Dr. Carlos Rodríguez Martín**: Psicología Infantil, Terapia Familiar, TDAH

### Pacientes  
- **Ana Martínez González**: Ansiedad laboral, Ingeniera de Software
- **Miguel Fernández López**: Depresión, Profesor

### Servicios
- **Consulta Individual Adultos**: 60€, 50 minutos
- **Terapia Infantil**: 55€, 45 minutos  
- **Evaluación Psicológica**: 120€, 90 minutos

### Salas
- **Consulta 1**: Física, capacidad 3 personas
- **Consulta 2**: Física, adaptada para terapia infantil
- **Sala Virtual Principal**: Jitsi Meet, capacidad 10 personas

## 🔄 Próximas Funcionalidades

### Frontend (En desarrollo)
- [ ] Interfaz de administración con Next.js
- [ ] Calendario interactivo para citas
- [ ] Portal de pacientes
- [ ] Panel de estadísticas visual

### Servicios Externos
- [x] Integración completa con Cloudflare R2
- [ ] Configuración de email SMTP
- [ ] Sistema de videollamadas Jitsi

### Funcionalidades Avanzadas
- [ ] Generación de PDFs para facturas
- [ ] Sistema de recordatorios automáticos
- [ ] Integración con pasarelas de pago
- [ ] Módulo de transcripciones con AI

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues**: Usar el sistema de issues de GitHub
- **Documentación**: Consultar `/memory-bank/` para información detallada
- **Email**: dev@arribapsicologia.com

## 📝 Changelog

### v0.1.0 (2025-08-15)
- ✅ Backend API completamente funcional
- ✅ Sistema de autenticación JWT
- ✅ CRUD completo para todas las entidades
- ✅ Base de datos MongoDB con datos semilla
- ✅ Documentación completa
- ✅ Docker Compose configurado

---

<div align="center">
  <p>Desarrollado con ❤️ para mejorar la gestión de centros de psicología</p>
  <p><strong>apsicologia Platform</strong> - Tecnología al servicio del bienestar mental</p>
</div>
