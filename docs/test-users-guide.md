# Guía de Usuarios de Prueba - apsicologia

## 📋 Resumen

Este documento describe los usuarios de prueba para el sistema de gestión de consulta psicológica **apsicologia**. Se han creado exitosamente **11 usuarios** (1 admin + 3 profesionales + 7 pacientes) para facilitar las pruebas del módulo de gestión de pacientes.

## ✅ Estado Actual

**PROBLEMA RESUELTO**: Se ha simplificado la creación de usuarios de prueba, creando únicamente registros en la tabla `User` sin las complejidades de los modelos `Professional` y `Patient`. Esto permite tener usuarios funcionales para pruebas de autenticación y roles.

## 🔐 Usuarios Disponibles para Pruebas

### Usuario Administrador
- **Email**: admin@arribapsicologia.com
- **Contraseña**: SecureAdmin2024!
- **Rol**: Administrador del sistema
- **Estado**: ✅ Creado y funcional

### Profesionales (3 usuarios)
- **Dr. Carlos Mendoza**: carlos.mendoza@arribapsicologia.com / Professional2024!
- **Dra. Ana Rodríguez**: ana.rodriguez@arribapsicologia.com / Professional2024!
- **Dr. Miguel Santos**: miguel.santos@arribapsicologia.com / Professional2024!

### Pacientes (7 usuarios)
- **María García**: maria.garcia@email.com / Patient2024!
- **Juan Pérez**: juan.perez@email.com / Patient2024!
- **Carmen López**: carmen.lopez@email.com / Patient2024!
- **Pedro Martín**: pedro.martin@email.com / Patient2024!
- **Lucía Fernández**: lucia.fernandez@email.com / Patient2024!
- **Diego Ruiz**: diego.ruiz@email.com / Patient2024!
- **Sandra Torres**: sandra.torres@email.com / Patient2024!

## 🚀 Cómo Usar el Sistema

### Acceso al Sistema
```bash
# Iniciar servicios (si tienes Docker)
docker compose -f docker-compose.dev.yml up -d

# O usar el script de inicialización básico
cd apps/api && npm run db:init
```

## 🔍 Funcionalidades de Prueba Disponibles

### Con Usuario Administrador

1. **Gestión de Pacientes**
   - Crear nuevos pacientes usando el modal "Nuevo Paciente"
   - Editar información de pacientes existentes
   - Buscar y filtrar pacientes
   - Exportar datos de pacientes (CSV/Excel)
   - Importar pacientes desde archivo CSV

2. **Control de Acceso**
   - Ver todos los pacientes (rol admin)
   - Acceder a todas las funcionalidades del sistema

3. **Validaciones y Formularios**
   - Formularios con react-hook-form y validación Zod
   - Notificaciones de éxito/error
   - Campos obligatorios y validaciones GDPR

## 🎯 Recomendaciones para Pruebas

### Crear Datos de Prueba Manualmente
En lugar de scripts automáticos, usa la interfaz web para:

1. **Crear Pacientes**: Usa el botón "Nuevo Paciente" en `/admin/patients`
2. **Probar CRUD**: Crear, editar, eliminar pacientes
3. **Probar Filtros**: Usar búsqueda por nombre, email, teléfono
4. **Probar Importación**: Crear un CSV con datos de pacientes

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Panel de Administración**: http://localhost:3000/admin
- **Gestión de Pacientes**: http://localhost:3000/admin/patients
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin123)

## 🧪 Casos de Prueba Recomendados

### Control de Acceso Basado en Roles
1. **Como Administrador**: Acceder con admin@arribapsicologia.com - Debe ver todos los pacientes
2. **Como Profesional**: Acceder con cualquier profesional - Debe ver solo pacientes asignados
3. **Como Paciente**: Acceder con cualquier paciente - Debe ver solo su información

### Operaciones CRUD de Pacientes
1. **Crear**: Usar el modal "Nuevo Paciente" con validación de formularios
2. **Leer**: Verificar filtros y búsqueda por nombre, email, teléfono
3. **Actualizar**: Editar información personal y clínica
4. **Eliminar**: Soft delete con confirmación

### Importación/Exportación
1. **Exportar**: Descargar datos en formato CSV/Excel
2. **Importar**: Subir archivo CSV con nuevos pacientes
3. **Validación**: Verificar manejo de errores en importación

### Funcionalidades Adicionales
1. **Notificaciones**: Verificar mensajes de éxito/error
2. **Paginación**: Navegar entre páginas de resultados
3. **Filtros**: Usar filtros por estado, género, etc.
4. **Búsqueda**: Buscar por diferentes criterios

## 📊 Estructura de Datos

### Profesionales
- Información personal completa
- Especialidades y años de experiencia
- Número de licencia único
- Estado activo por defecto

### Pacientes
- Información personal y de contacto
- Historial médico básico
- Contacto de emergencia
- Consentimiento GDPR
- Tags para categorización

## 🔧 Resolución de Problemas

### MongoDB no está ejecutándose
```bash
# Verificar estado de servicios Docker
docker ps

# Iniciar servicios si es necesario
docker compose -f docker-compose.dev.yml up -d
```

### Error de conexión a la base de datos
1. Verificar que MongoDB esté ejecutándose en puerto 27017
2. Comprobar credenciales en archivo .env
3. Usar diferentes URIs de conexión en el script

### Usuarios ya existen
- Usar `FORCE_INIT=true` para forzar reinicialización
- O usar `make reset-db` para reseteo completo

## 📝 Notas de Desarrollo

- Todas las contraseñas están hasheadas con bcrypt (12 rounds)
- Los ObjectId se generan automáticamente para mantener consistencia
- Los datos incluyen información realista para pruebas efectivas
- Se mantiene compatibilidad con el sistema de roles existente

## 🎯 Próximos Pasos

1. Ejecutar pruebas E2E con los nuevos usuarios
2. Validar funcionalidades de importación/exportación
3. Verificar rendimiento con mayor volumen de datos
4. Implementar tests unitarios para operaciones CRUD
5. Añadir logging de auditoría para acciones de usuarios
