# ╔══════════════════════════════════════════════════════════════════════╗
# ║  Ra7ti – Makefile                                                    ║
# ╚══════════════════════════════════════════════════════════════════════╝

.PHONY: help dev prod down logs ps \
        build build-backend build-frontend \
        migrate seed db-studio \
        push-images

# ── Colours ──────────────────────────────────────────────────────────────────
BOLD  := \033[1m
RESET := \033[0m
CYAN  := \033[36m

##@ General
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\n$(BOLD)Ra7ti commands$(RESET)\n\n"} \
	  /^[a-zA-Z_-]+:.*?##/ { printf "  $(CYAN)%-20s$(RESET) %s\n", $$1, $$2 } \
	  /^##@/ { printf "\n$(BOLD)%s$(RESET)\n", substr($$0, 5) }' $(MAKEFILE_LIST)

##@ Development
dev: ## Start all services in dev mode (hot-reload)
	docker compose up --build

dev-detach: ## Start dev services in background
	docker compose up --build -d

dev-proxy: ## Start dev services + nginx proxy
	docker compose --profile proxy up --build

down: ## Stop and remove containers
	docker compose down

##@ Production
prod-up: ## Start production stack (Coolify / VPS)
	docker compose -f docker-compose.prod.yml --env-file .env up -d

prod-down: ## Stop production stack
	docker compose -f docker-compose.prod.yml down

prod-logs: ## Tail production logs
	docker compose -f docker-compose.prod.yml logs -f

##@ Build
build: ## Build all Docker images
	docker compose -f docker-compose.prod.yml build

build-backend: ## Build only the backend image
	docker compose -f docker-compose.prod.yml build backend

build-frontend: ## Build only the frontend image
	docker compose -f docker-compose.prod.yml build frontend

push-images: ## Push images to registry (set REGISTRY, IMAGE_NAMESPACE, IMAGE_TAG)
	docker compose -f docker-compose.prod.yml push

##@ Database
migrate: ## Run Prisma migrations (dev)
	docker compose exec backend npx prisma migrate dev --schema=./prisma/schema.prisma

migrate-prod: ## Deploy migrations in production container
	docker compose -f docker-compose.prod.yml exec backend \
	  npx prisma migrate deploy --schema=./prisma/schema.prisma

seed: ## Seed the database with demo data
	docker compose exec backend npx ts-node prisma/seed.ts

db-studio: ## Open Prisma Studio (port 5555)
	cd backend && npx prisma studio --schema=../prisma/schema.prisma

##@ Logs & Status
logs: ## Tail all service logs (dev)
	docker compose logs -f

logs-backend: ## Tail backend logs
	docker compose logs -f backend

logs-frontend: ## Tail frontend logs
	docker compose logs -f frontend

ps: ## Show running containers
	docker compose ps

##@ Cleanup
clean: ## Stop containers and remove volumes (⚠ deletes data)
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.prod.yml down -v --remove-orphans

prune: ## Remove unused Docker images
	docker image prune -f
