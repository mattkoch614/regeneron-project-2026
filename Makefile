.PHONY: help setup test test-unit test-integration test-frontend test-watch clean start stop logs rebuild-frontend

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup              - Initial setup (copy .env.example, install deps)"
	@echo "  make test               - Run all tests (frontend + API)"
	@echo "  make test-frontend      - Run frontend unit tests"
	@echo "  make test-unit          - Run API unit tests"
	@echo "  make test-integration   - Run API contract tests (mocked, no DB)"
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

# Run all tests (frontend + API)
test:
	@echo "Running frontend tests..."
	@cd frontend && npm test
	@echo "Running API integration tests..."
	@cd api && npm run test:integration

# Unit tests (no DB required)
test-unit:
	@cd api && npm test

# Integration tests (mocked, no DB required)
test-integration:
	@echo "Running API contract tests..."
	@cd api && npm run test:integration

# Frontend tests
test-frontend:
	@echo "Running frontend tests..."
	@cd frontend && npm test

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