# Makefile para apsicologia - Gestión de desarrollo local

.PHONY: help setup start stop restart logs clean init-db reset-db

# Variables
COMPOSE_FILE = docker-compose.dev.yml
API_DIR = apps/api
WEB_DIR = apps/web

help: ## Mostrar ayuda
	@echo "🏥 apsicologia - Comandos de desarrollo"
	@echo "======================================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Configurar entorno de desarrollo por primera vez
	@echo "🚀 Configurando entorno de desarrollo..."
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "⏳ Esperando a que los servicios estén listos..."
	@sleep 10
	@echo "🎯 Inicializando base de datos..."
	@cd $(API_DIR) && npm run db:init
	@echo "✅ ¡Entorno configurado! Usa 'make start' para iniciar los servidores."

start: ## Iniciar servicios de desarrollo
	@echo "🚀 Iniciando servicios..."
	@docker-compose -f $(COMPOSE_FILE) up -d
	@echo "✅ Servicios iniciados. Usa 'make dev' para los servidores de desarrollo."

stop: ## Detener servicios
	@echo "🛑 Deteniendo servicios..."
	@docker-compose -f $(COMPOSE_FILE) down

restart: ## Reiniciar servicios
	@echo "🔄 Reiniciando servicios..."
	@docker-compose -f $(COMPOSE_FILE) restart

logs: ## Ver logs de los servicios
	@docker-compose -f $(COMPOSE_FILE) logs -f

dev-api: ## Iniciar servidor de desarrollo de la API
	@echo "🚀 Iniciando servidor de desarrollo de la API..."
	@cd $(API_DIR) && npm run dev

dev-web: ## Iniciar servidor de desarrollo del frontend
	@echo "🚀 Iniciando servidor de desarrollo del frontend..."
	@cd $(WEB_DIR) && npm run dev

dev: ## Iniciar ambos servidores de desarrollo (requiere terminales separadas)
	@echo "🚀 Para desarrollo completo, ejecuta en terminales separadas:"
	@echo "   Terminal 1: make dev-api"
	@echo "   Terminal 2: make dev-web"

init-db: ## Inicializar base de datos con datos de prueba
	@echo "🎯 Inicializando base de datos..."
	@cd $(API_DIR) && npm run db:init

reset-db: ## Resetear base de datos completamente
	@echo "⚠️  Reseteando base de datos..."
	@docker-compose -f $(COMPOSE_FILE) down -v
	@docker-compose -f $(COMPOSE_FILE) up -d
	@sleep 10
	@cd $(API_DIR) && FORCE_INIT=true npm run db:init

clean: ## Limpiar contenedores y volúmenes
	@echo "🧹 Limpiando entorno..."
	@docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans
	@docker system prune -f

status: ## Ver estado de los servicios
	@echo "📊 Estado de los servicios:"
	@docker-compose -f $(COMPOSE_FILE) ps

install: ## Instalar dependencias
	@echo "📦 Instalando dependencias..."
	@pnpm install

build: ## Construir aplicaciones
	@echo "🔨 Construyendo aplicaciones..."
	@pnpm build

test: ## Ejecutar tests
	@echo "🧪 Ejecutando tests..."
	@pnpm test

credentials: ## Mostrar credenciales de desarrollo
	@echo "🔐 CREDENCIALES DE DESARROLLO:"
	@echo "👤 Admin: admin@arribapsicologia.com / SecureAdmin2024!"
	@echo "👨‍⚕️ Professional 1: maria.garcia@arribapsicologia.com / Professional2024!"
	@echo "👨‍⚕️ Professional 2: carlos.rodriguez@arribapsicologia.com / Professional2024!"
	@echo "🏥 Patient 1: ana.martinez@email.com / Patient2024!"
	@echo "🏥 Patient 2: miguel.fernandez@email.com / Patient2024!"
	@echo ""
	@echo "🌐 URLs:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   API: http://localhost:3001"
	@echo "   MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"
