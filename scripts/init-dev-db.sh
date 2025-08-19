#!/bin/bash

# Script para inicializar la base de datos en desarrollo
# Se ejecuta automáticamente al levantar el entorno por primera vez

set -e

echo "🚀 Iniciando configuración de base de datos de desarrollo..."

# Esperar a que MongoDB esté disponible
echo "⏳ Esperando a que MongoDB esté disponible..."
until mongosh --host mongodb:27017 --username admin --password password123 --authenticationDatabase admin --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  echo "   MongoDB no está listo aún, esperando..."
  sleep 2
done
echo "✅ MongoDB está disponible"

# Esperar a que Redis esté disponible
echo "⏳ Esperando a que Redis esté disponible..."
until redis-cli -h redis -p 6379 -a redispassword123 ping > /dev/null 2>&1; do
  echo "   Redis no está listo aún, esperando..."
  sleep 2
done
echo "✅ Redis está disponible"

# Cambiar al directorio de la API
cd /app/apps/api

# Verificar si la base de datos ya está inicializada
echo "🔍 Verificando si la base de datos ya está inicializada..."

# Ejecutar script de inicialización
echo "🎯 Ejecutando inicialización de base de datos..."
npm run db:init

echo "🎉 ¡Inicialización completada!"
echo ""
echo "🔐 CREDENCIALES DE PRUEBA:"
echo "👤 Admin: admin@arribapsicologia.com / SecureAdmin2024!"
echo "👨‍⚕️ Professional 1: maria.garcia@arribapsicologia.com / Professional2024!"
echo "👨‍⚕️ Professional 2: carlos.rodriguez@arribapsicologia.com / Professional2024!"
echo "🏥 Patient 1: ana.martinez@email.com / Patient2024!"
echo "🏥 Patient 2: miguel.fernandez@email.com / Patient2024!"
echo ""
echo "🌐 Accede a la aplicación en: http://localhost:3000"
