# Contexto del Producto - apsicologia

## Problema que Resuelve
La plataforma apsicologia aborda las necesidades de gestión integral de centros de psicología, proporcionando una solución autoalojada que centraliza:

### Gestión Clínica
- **Historiales completos:** Seguimiento detallado de pacientes con episodios, alergias, notas y documentación
- **Notas clínicas:** Editor avanzado con plantillas, versionado y bloqueo/firmado digital
- **Transcripciones:** Procesamiento de audio de sesiones con whisper.cpp local
- **Cuestionarios:** Sistema dinámico de formularios personalizables con respuestas asociadas

### Gestión Operativa
- **Calendario inteligente:** Vista semanal/diaria con drag & drop, prevención de doble reservas
- **Agenda pública:** Sistema de reservas online con slots generados automáticamente
- **Videollamadas:** Integración con Jitsi Meet para sesiones remotas
- **Facturación:** Generación de PDF, series, impuestos, recordatorios de pago

### Gestión Administrativa
- **Profesionales:** Perfiles, especialidades, disponibilidades, vacaciones
- **Salas:** Gestión de espacios físicos y virtuales
- **Archivos:** Sistema de carpetas por paciente/cita con Cloudflare R2
- **Estadísticas:** KPIs y métricas de rendimiento del centro

## Experiencia del Usuario

### Para el Centro de Psicología
1. **Dashboard unificado:** Toda la información crítica en una vista
2. **Automatización:** Recordatorios, confirmaciones, generación de documentos
3. **Cumplimiento RGPD:** Gestión completa de consentimientos y auditoría
4. **Flexibilidad:** Configuración adaptable a diferentes flujos de trabajo

### Para los Profesionales
1. **Agenda personalizada:** Control total sobre disponibilidad y servicios
2. **Herramientas clínicas:** Notas, transcripciones, cuestionarios integrados
3. **Comunicación fluida:** Links de videollamada automáticos, recordatorios
4. **Autonomía:** Gestión independiente de sus pacientes y agenda

### Para los Pacientes
1. **Reservas online:** Sistema intuitivo de selección de citas
2. **Portal personal:** Acceso a historial, facturas, formularios
3. **Flexibilidad:** Reprogramación y cancelación según políticas
4. **Comunicación directa:** Recordatorios, confirmaciones, links de sesión

## Flujos de Trabajo Críticos

### 1. Reserva Online
```
Paciente → Selecciona servicio → Elige profesional → Elige fecha/hora
→ Completa datos → [Pago opcional] → Confirmación por email + ICS + Jitsi
```

### 2. Gestión de Citas (Profesional)
```
Nueva cita → Asignación automática de sala → Generación link Jitsi
→ Confirmación → Recordatorios automáticos → Sesión → Notas post-sesión
```

### 3. Facturación
```
Cita realizada → Marcar como pagada → Generar PDF automático
→ Envío por email → Registro de pago → Actualización estadísticas
```

### 4. Gestión de Disponibilidad
```
Profesional → Define horarios recurrentes → Marca vacaciones/ausencias
→ Sistema genera slots → Bloquea dobles reservas → Aplica buffers
```

## Objetivos de la Plataforma

### Eficiencia Operativa
- Reducir tiempo administrativo en un 70%
- Automatizar recordatorios y confirmaciones
- Eliminar dobles reservas y conflictos de agenda

### Calidad del Servicio
- Mejorar comunicación paciente-profesional
- Centralizar información clínica
- Facilitar seguimiento de tratamientos

### Cumplimiento y Seguridad
- Garantizar cumplimiento RGPD
- Auditoría completa de acciones
- Seguridad de datos clínicos

### Escalabilidad
- Soportar crecimiento del centro
- Adaptación a diferentes especialidades
- Integración con herramientas externas
