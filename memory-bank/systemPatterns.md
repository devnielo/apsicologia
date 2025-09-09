# Patrones del Sistema - apsicologia

## Arquitectura General

### Monorepo Structure
```
arribap/
├── apps/
│   ├── web/           # Next.js frontend
│   ├── api/           # Express API
│   └── docs/          # Documentación interna
├── packages/
│   ├── shared/        # Tipos compartidos, validaciones
│   ├── ui/            # Componentes shadcn/ui
│   ├── emails/        # Plantillas React Email
│   └── config/        # Configuraciones compartidas
├── docker/            # Configuraciones Docker
├── scripts/           # Scripts de despliegue
└── docs/             # Documentación del proyecto
```

## Patrones de Backend

### API REST con Express
- **Estructura modular:** Un módulo por entidad (users, appointments, patients, etc.)
- **Middleware chain:** auth → validation → business logic → response
- **Error handling:** Centralized error middleware con códigos HTTP apropiados
- **Logging:** Structured logging con pino (JSON format)

### Modelo de Datos (Mongoose)
- **Schemas estrictos:** Validación en modelo y API
- **Relaciones:** ObjectId references con populate selectivo
- **Middlewares:** Pre/post hooks para auditoría y validaciones
- **Indexing:** Índices compuestos para queries frecuentes

### Gestión de Colas (BullMQ)
```typescript
// Patrón de jobs
export interface JobTypes {
  'send-email': EmailJobData;
  'send-reminder': ReminderJobData;
  'process-transcription': TranscriptionJobData;
  'generate-invoice-pdf': InvoiceJobData;
}
```

### Autenticación y Autorización
- **JWT tokens:** Access (15min) + Refresh (7 days)
- **RBAC:** Role-based con permisos granulares
- **2FA opcional:** TOTP con QR code generation
- **Session management:** Redis store para invalidación

## Patrones de Frontend

### Next.js App Router Structure
```
apps/web/src/
├── app/
│   ├── (auth)/        # Auth routes group
│   ├── (dashboard)/   # Admin panel routes
│   ├── (public)/      # Marketing + booking
│   └── (patient)/     # Patient portal
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── forms/        # Form components
│   ├── calendar/     # Calendar components
│   └── shared/       # Reusable components
└── lib/
    ├── auth/         # Auth utilities
    ├── api/          # API client functions
    ├── hooks/        # Custom React hooks
    └── utils/        # Utility functions
```

### Estado y Data Fetching
- **TanStack Query:** Server state management
- **React Hook Form:** Form state con Zod validation
- **Context:** Minimal client state (theme, user preferences)
- **Optimistic updates:** Para acciones críticas del calendar

### Componente Patterns
```typescript
// Compound component pattern para complex UI
export const AppointmentCard = {
  Root: AppointmentCardRoot,
  Header: AppointmentCardHeader,
  Content: AppointmentCardContent,
  Actions: AppointmentCardActions,
};

// Hook pattern para business logic
export function useAppointment(id: string) {
  // Query, mutations, business logic
}
```

## Patrones de Seguridad

### Input Validation
1. **Client-side:** Immediate feedback con Zod schemas
2. **API layer:** Re-validation con mismos schemas
3. **Database:** Schema constraints como última línea

### Audit Trail
```typescript
interface AuditLog {
  actorId: ObjectId;
  action: string;        // 'create', 'update', 'delete'
  entity: string;        // 'appointment', 'patient'
  entityId: ObjectId;
  changes?: object;      // diff de cambios
  metadata: {
    ip: string;
    userAgent: string;
    timestamp: Date;
  };
}
```

### RGPD Compliance
- **Consent tracking:** Timestamps y versiones de políticas
- **Data export:** JSON structured export por paciente
- **Right to deletion:** Soft delete con anonymization
- **Retention policies:** Automated cleanup jobs

## Patrones de Integración

### Cloudflare R2 (File Storage)
- **Presigned URLs:** Para uploads directos desde frontend
- **Bucket organization:** `/patients/{id}/`, `/appointments/{id}/`
- **Metadata:** Content-type, upload timestamp, owner
- **Access control:** Pre-signed URL expiration

### Jitsi Meet Integration
```typescript
interface JitsiRoom {
  roomId: string;        // unique per appointment
  domain: string;        // jitsi domain
  jwt?: string;          // optional auth token
  config: {
    startWithAudioMuted: boolean;
    startWithVideoMuted: boolean;
    requireDisplayName: boolean;
  };
}
```

### Email System (Nodemailer + React Email)
- **Template engine:** React Email components
- **Queue processing:** BullMQ para reliability
- **Tracking:** Delivery status, opens, clicks
- **Templating:** Personalization con patient/appointment data

## Patrones de Calendario

### Slot Generation Algorithm
```typescript
interface SlotGenerationRules {
  professionalId: ObjectId;
  serviceId: ObjectId;
  availability: WeeklyAvailability[];  // RRULE patterns
  bufferMinutes: number;              // between appointments
  vacations: DateRange[];             // blocked periods
  holidays: Date[];                   // national holidays
}
```

### Conflict Prevention
1. **Database constraints:** Unique index en (professional, timeSlot)
2. **Optimistic locking:** Version field en appointments
3. **Real-time validation:** Check availability antes de save
4. **UI feedback:** Immediate visual feedback en drag & drop

## Patrones de Performance

### Caching Strategy
- **Redis:** Session data, frequent queries, computed slots
- **Browser:** TanStack Query cache con stale-while-revalidate
- **CDN:** Static assets, images optimizadas con Next.js
- **Database:** Query optimization con proper indexing

### Lazy Loading
- **Routes:** Next.js dynamic imports
- **Components:** React.lazy para heavy components
- **Data:** Infinite queries para listados largos
- **Images:** Next.js Image component con lazy loading

## Patrones de Testing

### Testing Strategy
```typescript
// Unit tests - Jest
export function calculateAppointmentEnd(
  start: Date, 
  durationMinutes: number
): Date

// Integration tests - Supertest
describe('POST /api/appointments', () => {
  it('should create appointment and send confirmation email')
})

// E2E tests - Playwright
test('should complete booking flow', async ({ page }) => {
  // Full user journey testing
})
```

### Test Data Management
- **Seeds:** Consistent test data para development
- **Factories:** Programmatic test data generation
- **Cleanup:** Automated test database cleanup
- **Mocking:** External services (email, payments)
