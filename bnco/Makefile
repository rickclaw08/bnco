# bnco Makefile
# Common commands for development and deployment

.PHONY: dev dev-build down clean migrate seed test build deploy logs ps

# ---- Local Development ----

# Start local dev environment (hot reload)
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Build and start production-like containers
dev-build:
	docker-compose up --build -d

# Stop all services
down:
	docker-compose down

# Stop all services and remove volumes (full reset)
clean:
	docker-compose down -v --remove-orphans

# ---- Database ----

# Run database migrations (via connect-layer npm script)
migrate:
	cd src/connect-layer && npm run migrate

# Seed test data
seed:
	cd src/connect-layer && npm run seed

# Open psql shell to local database
psql:
	docker-compose exec postgres psql -U bnco -d bnco

# ---- Testing ----

# Run backend tests
test:
	cd src/connect-layer && npm test

# ---- Frontend ----

# Build frontend for production
build:
	cd app && npm run build

# Start frontend dev server (no Docker)
frontend-dev:
	cd app && npm run dev

# ---- Deployment ----

# Deploy backend to Railway
deploy-api:
	railway up

# Deploy frontend to Netlify
deploy-frontend:
	cd app && npx netlify-cli deploy --prod --dir=dist --site=7b9aae37-a1af-4244-8cd3-e2522c38536e

# Deploy everything
deploy: deploy-api deploy-frontend

# ---- Utilities ----

# Tail logs from all services
logs:
	docker-compose logs -f

# Show running services
ps:
	docker-compose ps

# Install all dependencies (both frontend and backend)
install:
	cd src/connect-layer && npm install
	cd app && npm install

# Health check
health:
	@curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null || echo "API not responding"
