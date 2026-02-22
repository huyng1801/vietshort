#!/bin/sh
# ============================================
# VietShort - Docker Development Helper
# ============================================
# Usage:
#   ./docker/scripts/dev.sh up       - Start all services
#   ./docker/scripts/dev.sh down     - Stop all services
#   ./docker/scripts/dev.sh restart  - Restart all services
#   ./docker/scripts/dev.sh logs     - View logs
#   ./docker/scripts/dev.sh shell    - Enter backend shell
#   ./docker/scripts/dev.sh db       - Enter MySQL shell
#   ./docker/scripts/dev.sh redis    - Enter Redis CLI
#   ./docker/scripts/dev.sh seed     - Run database seeds
#   ./docker/scripts/dev.sh migrate  - Run Prisma migrations
#   ./docker/scripts/dev.sh reset    - Reset everything (destroy volumes)
#   ./docker/scripts/dev.sh build    - Rebuild all images
#   ./docker/scripts/dev.sh status   - Show container status
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$PROJECT_ROOT"

# Copy .env.docker to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "${YELLOW}Creating .env from .env.docker...${NC}"
    cp .env.docker .env
fi

case "$1" in
    up)
        echo "${GREEN}Starting VietShort development stack...${NC}"
        docker compose up -d
        echo "${GREEN}All services started!${NC}"
        echo "${BLUE}  Backend API:  http://localhost:3000${NC}"
        echo "${BLUE}  Client Web:   http://localhost:3001${NC}"
        echo "${BLUE}  Admin CMS:    http://localhost:3002${NC}"
        echo "${BLUE}  MySQL:        localhost:3307${NC}"
        echo "${BLUE}  Redis:        localhost:6379${NC}"
        ;;
    down)
        echo "${YELLOW}Stopping all services...${NC}"
        docker compose down
        echo "${GREEN}All services stopped.${NC}"
        ;;
    restart)
        echo "${YELLOW}Restarting services...${NC}"
        docker compose restart ${2:-}
        ;;
    logs)
        docker compose logs -f ${2:-}
        ;;
    shell)
        echo "${BLUE}Entering backend shell...${NC}"
        docker compose exec backend sh
        ;;
    db)
        echo "${BLUE}Entering MySQL shell...${NC}"
        docker compose exec mysql mysql -u vietshort_user -pvietshort_pass vietshort
        ;;
    redis)
        echo "${BLUE}Entering Redis CLI...${NC}"
        docker compose exec redis redis-cli
        ;;
    seed)
        echo "${GREEN}Running database seeds...${NC}"
        docker compose exec backend npx prisma db seed
        ;;
    migrate)
        echo "${GREEN}Running Prisma migrations...${NC}"
        docker compose exec backend npx prisma migrate deploy
        ;;
    reset)
        echo "${RED}WARNING: This will destroy all data!${NC}"
        printf "Are you sure? [y/N] "
        read -r answer
        if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
            docker compose down -v
            echo "${GREEN}All data cleared. Run '$0 up' to start fresh.${NC}"
        else
            echo "${YELLOW}Cancelled.${NC}"
        fi
        ;;
    build)
        echo "${GREEN}Rebuilding all images...${NC}"
        docker compose build --no-cache ${2:-}
        ;;
    status)
        docker compose ps
        ;;
    *)
        echo "VietShort Docker Development Helper"
        echo ""
        echo "Usage: $0 {up|down|restart|logs|shell|db|redis|seed|migrate|reset|build|status}"
        echo ""
        echo "Commands:"
        echo "  up       - Start all services"
        echo "  down     - Stop all services"
        echo "  restart  - Restart all services (optionally: restart backend)"
        echo "  logs     - View logs (optionally: logs backend)"
        echo "  shell    - Enter backend container shell"
        echo "  db       - Enter MySQL interactive shell"
        echo "  redis    - Enter Redis CLI"
        echo "  seed     - Run database seeds"
        echo "  migrate  - Run Prisma migrations"
        echo "  reset    - Destroy all data and volumes"
        echo "  build    - Rebuild Docker images"
        echo "  status   - Show container status"
        exit 1
        ;;
esac
