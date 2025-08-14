# Contexto Activo - apsicologia

## Estado Actual del Proyecto
**Fecha:** 14/8/2025
**Fase:** Desarrollo del Backend Core - Sistema de Pagos

## Current Progress Status

### ✅ Completed Core Infrastructure
- **Monorepo Structure**: pnpm workspaces configurado con packages/shared y apps/api
- **Base Dependencies**: TypeScript, ESLint, Prettier, Docker configurados
- **Database Layer**: MongoDB con Mongoose, modelos base implementados
- **Authentication System**: JWT auth con roles (admin, professional, reception, patient)
- **Validation System**: Zod schemas compartidos entre frontend/backend
- **Audit System**: Logging completo de acciones con AuditLog model
- **Error Handling**: Middleware centralizado para manejo de errores

### ✅ Implemented Models & Controllers
- **User Management**: Modelo User, AuthController con login/register/2FA
- **Invoice System**: Modelo Invoice completo con totales automáticos, PDF, series
- **Payment System**: Modelo Payment completo con múltiples métodos, reembolsos, fees
- **Form System**: FormSchema y FormResponse para cuestionarios dinámicos
- **Notes System**: Modelo Note con control de versiones y firmas
- **File System**: Modelo File para gestión de archivos con MinIO
- **Audit System**: AuditLog para tracking completo de acciones

### ✅ API Endpoints Implemented
- **Authentication**: `/api/v1/auth/*` - Login, register, 2FA, refresh tokens
- **User Management**: `/api/v1/users/*` - CRUD operations con RBAC
- **Invoice Management**: `/api/v1/invoices/*` - Facturación completa con PDF, series, etc.
- **Payment Management**: `/api/v1/payments/*` - Pagos, reembolsos, estadísticas

## Trabajo Reciente Completado

### ✅ Payment System Implementation
1. **Payment Model** (`apps/api/src/models/Payment.ts`)
   - Modelo completo con soporte para múltiples métodos de pago
   - Sistema de fees y comisiones automático
   - Soporte para reembolsos parciales y totales
   - Reconciliación bancaria y auditoría
   - Seguridad anti-fraude con scoring
   - Split payments para múltiples beneficiarios

2. **Payment Controller** (`apps/api/src/controllers/payment.controller.ts`)
   - CRUD operations con paginación y filtrado avanzado
   - Registro manual de pagos por admin/reception/professional
   - Sistema de reembolsos (solo admin)
   - Estadísticas y reportes por método, período, profesional
   - RBAC granular para acceso a pagos
   - Integración con facturas para actualización automática de estados

3. **Payment Routes** (`apps/api/src/routes/payment.routes.ts`)
   - GET `/api/v1/payments` - Lista con filtros y paginación
   - GET `/api/v1/payments/:id` - Detalle de pago individual
   - POST `/api/v1/payments` - Registro manual de pagos
   - POST `/api/v1/payments/:id/refund` - Reembolsos (admin only)
   - GET `/api/v1/payments/stats` - Estadísticas y KPIs
   - Documentación Swagger completa para todos los endpoints

## Foco de Trabajo Actual
**Sistema de Pagos Completado**
- ✅ Modelo Payment con todas las funcionalidades
- ✅ Controller con operaciones CRUD, reembolsos, estadísticas
- ✅ Routes con documentación Swagger
- ✅ Integración con sistema de facturas
- ✅ RBAC y seguridad implementados

## Próximos Pasos Inmediatos

### 1. Patient Management System
- [ ] Crear modelo Patient con historial clínico completo
- [ ] Implementar PatientController con CRUD y búsqueda
- [ ] Sistema de consentimientos RGPD
- [ ] Gestión de archivos por paciente
- [ ] Etiquetas y campañas

### 2. Professional Management System
- [ ] Modelo Professional con especialidades y horarios
- [ ] Sistema de disponibilidades recurrentes (RRULE)
- [ ] Gestión de vacaciones y ausencias
- [ ] Servicios que presta cada profesional

### 3. Appointment System (Core)
- [ ] Modelo Appointment con estados completos
- [ ] Sistema de generación de slots disponibles
- [ ] Prevención de conflictos y doble reserva
- [ ] Integración con pagos y facturas

### 4. Calendar Core Logic
- [ ] Algoritmo de generación de slots
- [ ] Manejo de buffers entre citas
- [ ] Zonas horarias y DST
- [ ] Filtros por profesional/sala/servicio

## Decisiones Técnicas Confirmadas

### Payment System Architecture
- **Multiple Payment Methods**: Cash, card, transfer, stripe, paypal, check, insurance
- **Fee Calculation**: Automático por método (Stripe 1.4%+€0.25, PayPal 3.4%+€0.35)
- **Refund System**: Parciales y totales con trazabilidad completa
- **Security**: Fraud scoring, 3D Secure, CVC/AVS checks
- **Reconciliation**: Sistema manual de reconciliación bancaria
- **Audit Trail**: Log completo de todas las acciones

### Payment-Invoice Integration
- **Automatic Status Updates**: Las facturas se actualizan cuando se registran pagos
- **Partial Payments**: Soporte para pagos parciales con estados intermedios
- **Amount Validation**: Validación que el pago no exceda el monto pendiente
- **Rollback on Refunds**: Los reembolsos actualizan los totales de factura

### RBAC for Payments
- **Admin**: Acceso total, puede hacer reembolsos
- **Reception**: Puede registrar pagos y ver todos los pagos
- **Professional**: Solo puede registrar pagos para sus propias facturas
- **Patient**: Solo puede ver sus propios pagos

## Arquitectura y Patrones Implementados

### Database Patterns
- **Compound Indexes**: Para queries eficientes por fecha, método, estado
- **Text Search**: Búsqueda full-text en referencias y notas
- **Aggregation Pipelines**: Para estadísticas y reportes complejos
- **Soft Delete**: Todos los registros mantienen trazabilidad

### API Patterns
- **Consistent Response Format**: Siempre `{ success, data?, message?, error? }`
- **Pagination**: Estándar con `page`, `limit`, `totalPages`, `hasNext/Prev`
- **Filtering**: URLs query params para filtros complejos
- **Sorting**: Parametrizable por cualquier campo
- **Validation**: Zod schemas en todas las rutas

### Security Patterns
- **Authentication**: JWT required en todas las rutas
- **Authorization**: Role-based checks en cada endpoint
- **Input Validation**: Zod validation middleware
- **Audit Logging**: Todas las acciones registradas con contexto completo
- **Rate Limiting**: Preparado para implementar por IP/usuario

## Consideraciones de Rendimiento

### Payment Queries Optimization
- **Indexes**: Compound indexes en `(patientId, status)`, `(status, paymentDate)`, etc.
- **Caching**: Redis para estadísticas frecuentes (TTL 1 hora)
- **Aggregation**: Pipeline optimizado para reportes mensuales
- **Pagination**: Limit queries para evitar scans completos

### Payment Processing Flow
1. **Validation**: Verificar invoice y permisos
2. **Amount Check**: Validar que no exceda monto pendiente
3. **Payment Creation**: Crear registro con fees calculados
4. **Invoice Update**: Actualizar totales y estado
5. **Appointment Update**: Actualizar estado de citas relacionadas
6. **Audit Log**: Registrar acción completa

## Riesgos y Mitigaciones

### Riesgo: Concurrencia en pagos
- **Mitigación**: Validation de amounts al guardar, optimistic locking
- **Plan B**: Implementar database transactions si es necesario

### Riesgo: Integridad de datos pago-factura
- **Mitigación**: Validaciones estrictas, audit logs completos
- **Rollback**: Capacidad de revertir cambios con audit trail

### Riesgo: Fees calculation errors
- **Mitigación**: Tests unitarios extensivos, fees configurables
- **Monitoring**: Alertas si fees fuera de rangos esperados

## Testing Strategy (Pendiente)
- [ ] Unit tests para Payment model methods
- [ ] Integration tests para PaymentController
- [ ] E2E tests para flujos críticos de pago
- [ ] Performance tests para queries con volumen

## ✅ COMPLETADO: Patient Management System
**Fecha de Completación**: 14/8/2025
**Tiempo Real**: 1 sesión

### Implementación Completada:
1. **Patient Model** (`apps/api/src/models/Patient.ts`) - **COMPLETO**
   - Modelo extenso con información personal, clínica, seguros, preferencias
   - Sistema GDPR completo con consentimientos y trazabilidad
   - Historial médico y mental health tracking
   - Episodios de tratamiento con objetivos y seguimiento
   - Tags y categorización avanzada
   - Estadísticas automáticas (citas, pagos, ratings)
   - Métodos de instancia: addTag, removeTag, exportData, softDelete
   - Métodos estáticos: findByEmail, findByPhone, searchPatients
   - Indexes compuestos para rendimiento

2. **Patient Controller** (`apps/api/src/controllers/patient.controller.ts`) - **COMPLETO**
   - CRUD operations con paginación y filtrado avanzado
   - Búsqueda por múltiples campos (nombre, email, teléfono, ID)
   - Sistema de tags (agregar/remover)
   - Export GDPR compliance con audit logs
   - Soft delete con validaciones de seguridad
   - Estadísticas por profesional/período
   - Creación automática de cuentas de usuario para portal
   - RBAC granular (professional solo ve pacientes asignados)

3. **Patient Routes** (`apps/api/src/routes/patient.routes.ts`) - **COMPLETO**
   - GET `/api/v1/patients` - Lista con filtros (estado, profesional, edad, género, etc.)
   - GET `/api/v1/patients/search` - Búsqueda avanzada con term query
   - GET `/api/v1/patients/stats` - Estadísticas y KPIs
   - GET `/api/v1/patients/:id` - Detalle con includes opcionales (appointments, invoices, files)
   - POST `/api/v1/patients` - Creación con GDPR consent obligatorio
   - PUT `/api/v1/patients/:id` - Actualización con audit tracking
   - POST `/api/v1/patients/:id/tags` - Agregar tags
   - DELETE `/api/v1/patients/:id/tags/:tagName` - Remover tags
   - GET `/api/v1/patients/:id/export` - Export GDPR
   - DELETE `/api/v1/patients/:id` - Soft delete (admin only)

### Características Avanzadas Implementadas:
- **GDPR Compliance**: Export de datos, derecho al olvido, consent tracking
- **Clinical History**: Condiciones, medicaciones, alergias, cirugías
- **Mental Health Tracking**: Diagnósticos, tratamientos previos, factores de riesgo
- **Insurance Management**: Seguros primario/secundario, autorizaciones, copagos
- **Episode Management**: Ciclos de tratamiento con objetivos y seguimiento
- **Portal Integration**: Creación automática de cuentas para acceso del paciente
- **Advanced Search**: Búsqueda por texto completo y filtros múltiples
- **Statistics & Analytics**: KPIs por demografía, tratamiento, pagos

## Próximo Hito: Professional & Appointment System
**Objetivo**: Sistema de profesionales con disponibilidades y citas
**Tiempo Estimado**: 2-3 días
**Componentes**:
- Modelo Professional con especialidades y horarios
- Sistema de disponibilidades recurrentes (RRULE)
- Modelo Appointment con prevención de conflictos
- Algoritmo de generación de slots
