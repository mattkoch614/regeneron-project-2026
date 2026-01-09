.PHONY: help setup test test-unit test-integration test-watch clean start stop logs rebuild-frontend

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup              - Initial setup (copy .env.example, install deps)"
	@echo "  make test               - Run all unit tests"
	@echo "  make test-unit          - Run unit tests"
	@echo "  make test-integration   - Run integration tests (starts DB if needed)"
	@echo "  make test-watch         - Run unit tests in watch mode"
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

# Unit tests (no DB required)
test:
	@cd api && npm test

test-unit:
	@cd api && npm test

# Integration tests (requires DB)
test-integration:
	@echo "Starting test database..."
	@docker compose --profile test up -d postgres-test
	@echo "Waiting for database to be ready..."
	@sleep 2
	@docker compose --profile test run --rm seed-test
	@echo "Running integration tests..."
	@cd api && npm run test:integration
	@echo "Stopping test database..."
	@docker compose --profile test down

# Watch mode for unit tests
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