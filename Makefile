.PHONY: help setup test test-frontend test-watch clean start stop logs rebuild-frontend

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup              - Initial setup (copy .env.example, install deps)"
	@echo "  make test               - Run all tests (frontend + API)"
	@echo "  make test-frontend      - Run frontend tests only"
	@echo "  make test-watch         - Run API tests in watch mode"
	@echo "  make start              - Start all services (dev environment)"
	@echo "  make stop               - Stop all services"
	@echo "  make logs               - Show logs for all services"
	@echo "  make rebuild-frontend   - Rebuild and restart frontend service"
	@echo "  make clean              - Stop services and clean up volumes"

# Initial setup
setup:
	@echo "Setting up environment..."
	@test -f api/.env || cp api/.env.example api/.env
	@echo "Installing dependencies..."
	@cd api && npm install
	@echo "Setup complete! Edit api/.env if needed."

# Run all tests (frontend + API)
test:
	@echo "Running frontend tests..."
	@cd frontend && npm test
	@echo "Running API tests..."
	@cd api && npm test

# Frontend tests only
test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm test

# Watch mode for API tests
test-watch:
	@cd api && npm run test:watch

# Development commands
start:
	@docker compose up -d

stop:
	@docker compose down

logs:
	@docker compose logs -f

# Rebuild frontend
rebuild-frontend:
	@echo "Rebuilding frontend..."
	@docker compose build frontend
	@docker compose up -d frontend
	@echo "Frontend rebuilt and restarted!"

# Clean up
clean:
	@echo "Stopping all services and cleaning up..."
	@docker compose --profile test down -v
	@docker compose down -v
	@echo "Cleanup complete!"
