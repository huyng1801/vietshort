# ============================================
# VietShort - Makefile
# ============================================
# Quick commands for Docker development
# Usage: make <command>
# ============================================

.PHONY: help up down restart logs build reset seed migrate status shell db redis prod

# Default
help: ## Show this help
	@echo "VietShort Docker Commands"
	@echo "========================"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ─── Development ─────────────────────────────
up: ## Start development stack
	docker compose up -d
	@echo ""
	@echo "✅ VietShort started!"
	@echo "  Backend API:  http://localhost:3000"
	@echo "  Client Web:   http://localhost:3001"
	@echo "  Admin CMS:    http://localhost:3002"
	@echo "  MySQL:        localhost:3307"
	@echo "  Redis:        localhost:6379"

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## View all logs (use: make logs s=backend)
	docker compose logs -f $(s)

build: ## Rebuild all images (use: make build s=backend)
	docker compose build --no-cache $(s)

status: ## Show container status
	docker compose ps

# ─── Database ────────────────────────────────
seed: ## Run database seeds
	docker compose exec backend npx prisma db seed

migrate: ## Run Prisma migrations
	docker compose exec backend npx prisma migrate deploy

migrate-dev: ## Create new migration (use: make migrate-dev name=add_field)
	docker compose exec backend npx prisma migrate dev --name $(name)

studio: ## Open Prisma Studio
	docker compose exec backend npx prisma studio

# ─── Shell Access ────────────────────────────
shell: ## Enter backend shell
	docker compose exec backend sh

db: ## Enter MySQL shell
	docker compose exec mysql mysql -u vietshort_user -pvietshort_pass vietshort

redis: ## Enter Redis CLI
	docker compose exec redis redis-cli

# ─── Production ──────────────────────────────
prod: ## Start production stack
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

prod-down: ## Stop production stack
	docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# ─── Cleanup ─────────────────────────────────
reset: ## ⚠️  Destroy all data and restart fresh
	@echo "⚠️  WARNING: This will destroy all data!"
	@read -p "Are you sure? [y/N] " ans && [ $${ans:-N} = y ]
	docker compose down -v
	@echo "✅ All data cleared. Run 'make up' to start fresh."

clean: ## Remove all Docker artifacts
	docker compose down -v --rmi local
	docker system prune -f

# ─── Testing ─────────────────────────────────
test: ## Run backend tests
	docker compose exec backend npm test

test-e2e: ## Run backend e2e tests
	docker compose exec backend npm run test:e2e
