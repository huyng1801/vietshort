<# 
.SYNOPSIS
    VietShort Docker Development Helper for Windows

.DESCRIPTION
    Convenient commands to manage the Docker development stack on Windows.

.EXAMPLE
    .\docker\scripts\dev.ps1 up       # Start all services
    .\docker\scripts\dev.ps1 down     # Stop all services
    .\docker\scripts\dev.ps1 logs     # View logs
    .\docker\scripts\dev.ps1 shell    # Enter backend shell
    .\docker\scripts\dev.ps1 db       # Enter MySQL shell
    .\docker\scripts\dev.ps1 seed     # Run database seeds
    .\docker\scripts\dev.ps1 reset    # Reset everything
#>

param(
    [Parameter(Position = 0)]
    [ValidateSet('up', 'down', 'restart', 'logs', 'shell', 'db', 'redis', 'seed', 'migrate', 'reset', 'build', 'status', 'help')]
    [string]$Command = 'help',

    [Parameter(Position = 1, ValueFromRemainingArguments)]
    [string[]]$Args
)

$ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
Push-Location $ProjectRoot

try {
    # Copy .env.docker to .env if it doesn't exist
    if (-not (Test-Path ".env")) {
        Write-Host "Creating .env from .env.docker..." -ForegroundColor Yellow
        Copy-Item ".env.docker" ".env"
    }

    switch ($Command) {
        'up' {
            Write-Host "Starting VietShort development stack..." -ForegroundColor Green
            docker compose up -d
            Write-Host ""
            Write-Host "All services started!" -ForegroundColor Green
            Write-Host "  Backend API:  http://localhost:3000" -ForegroundColor Cyan
            Write-Host "  Client Web:   http://localhost:3001" -ForegroundColor Cyan
            Write-Host "  Admin CMS:    http://localhost:3002" -ForegroundColor Cyan
            Write-Host "  MySQL:        localhost:3307" -ForegroundColor Cyan
            Write-Host "  Redis:        localhost:6379" -ForegroundColor Cyan
        }
        'down' {
            Write-Host "Stopping all services..." -ForegroundColor Yellow
            docker compose down
            Write-Host "All services stopped." -ForegroundColor Green
        }
        'restart' {
            Write-Host "Restarting services..." -ForegroundColor Yellow
            if ($Args) {
                docker compose restart @Args
            } else {
                docker compose restart
            }
        }
        'logs' {
            if ($Args) {
                docker compose logs -f @Args
            } else {
                docker compose logs -f
            }
        }
        'shell' {
            Write-Host "Entering backend shell..." -ForegroundColor Cyan
            docker compose exec backend sh
        }
        'db' {
            Write-Host "Entering MySQL shell..." -ForegroundColor Cyan
            docker compose exec mysql mysql -u vietshort_user -pvietshort_pass vietshort
        }
        'redis' {
            Write-Host "Entering Redis CLI..." -ForegroundColor Cyan
            docker compose exec redis redis-cli
        }
        'seed' {
            Write-Host "Running database seeds..." -ForegroundColor Green
            docker compose exec backend npx prisma db seed
        }
        'migrate' {
            Write-Host "Running Prisma migrations..." -ForegroundColor Green
            docker compose exec backend npx prisma migrate deploy
        }
        'reset' {
            Write-Host "WARNING: This will destroy all data!" -ForegroundColor Red
            $answer = Read-Host "Are you sure? [y/N]"
            if ($answer -eq 'y' -or $answer -eq 'Y') {
                docker compose down -v
                Write-Host "All data cleared. Run '.\docker\scripts\dev.ps1 up' to start fresh." -ForegroundColor Green
            } else {
                Write-Host "Cancelled." -ForegroundColor Yellow
            }
        }
        'build' {
            Write-Host "Rebuilding all images..." -ForegroundColor Green
            if ($Args) {
                docker compose build --no-cache @Args
            } else {
                docker compose build --no-cache
            }
        }
        'status' {
            docker compose ps
        }
        'help' {
            Write-Host ""
            Write-Host "VietShort Docker Development Helper" -ForegroundColor Green
            Write-Host "===================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Usage: .\docker\scripts\dev.ps1 <command> [service]" -ForegroundColor White
            Write-Host ""
            Write-Host "Commands:" -ForegroundColor Yellow
            Write-Host "  up       - Start all services"
            Write-Host "  down     - Stop all services"
            Write-Host "  restart  - Restart all (or specific) services"
            Write-Host "  logs     - View logs (optionally: logs backend)"
            Write-Host "  shell    - Enter backend container shell"
            Write-Host "  db       - Enter MySQL interactive shell"
            Write-Host "  redis    - Enter Redis CLI"
            Write-Host "  seed     - Run database seeds"
            Write-Host "  migrate  - Run Prisma migrations"
            Write-Host "  reset    - Destroy all data and volumes"
            Write-Host "  build    - Rebuild Docker images"
            Write-Host "  status   - Show container status"
            Write-Host ""
        }
    }
} finally {
    Pop-Location
}
