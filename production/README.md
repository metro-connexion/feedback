# Production Docker Setup

This directory contains the Docker Compose configuration for running the Feedback application in production.

## Services

The docker-compose.yml file defines three services:

1. **postgres**: PostgreSQL 18.1 database
2. **api**: Node.js backend API
3. **web**: Vue.js frontend (served via Nginx)

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1. Copy the sample environment file:
   ```bash
   cp sample.env .env
   ```

2. **Secure the .env file**:
   ```bash
   chmod 600 .env
   ```

3. Edit the `.env` file and configure all variables as needed. **All configuration is done through the .env file**, including:
   - **Database settings**: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_PORT`
   - **API settings**: `API_PORT`, `NODE_ENV`
   - **Security**: `TOKEN_SECRET` (generate with `openssl rand -base64 32`), `PASSWORD_HASH`
   - **Application**: `BASE_URL` (set to your production domain), `LOG_LEVEL`, etc.
   - **Email** (if needed): `MAILING_ENABLED`, `MAILING_SERVICE`, `MAILING_USER`, `MAILING_PASSWORD`, etc.
   
   ⚠️ **Important**: Never commit the `.env` file to version control!

4. Start the services:
   ```bash
   docker compose up -d
   ```
   
   **Note**: Database migrations will run automatically when the API container starts.

5. (Optional) Seed the database:
   ```bash
   docker compose exec api npm run db:seed
   ```

## Accessing the Application

- **Web UI**: http://localhost (or your configured WEB_PORT)
- **API**: http://localhost:3000 (or your configured API_PORT)
- **Database**: localhost:5432 (or your configured DATABASE_PORT)

## Managing Services

### View logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres
```

### Stop services
```bash
docker compose down
```

### Stop and remove volumes (WARNING: This will delete all data)
```bash
docker compose down -v
```

### Rebuild services
```bash
docker compose up -d --build
```

## Environment Variables

See `sample.env` for all available configuration options.

## Volumes

- `postgres_data`: Persists PostgreSQL data

## Networks

All services communicate via the `feedback-network` bridge network.

## Health Checks

The services become healthy in order: `postgres` → `api` → `web`. On first startup, it can take up to ~70–90 seconds for all services to report as healthy, depending on your machine and Docker configuration.

- **postgres**: Checks if PostgreSQL is ready
- **api**: Checks the `/api/healthcheck` endpoint (depends on `postgres`)
- **web**: Checks if Nginx is responding (depends on `api`, so it will only become healthy after the API is healthy)

You can adjust healthcheck intervals, retries, and `start_period` values in `docker-compose.yml` if you need different startup behavior.
## Troubleshooting

### API cannot connect to database
Check that the postgres service is healthy:
```bash
docker compose ps
```

### Check service logs
```bash
docker compose logs api
```

### Access a service shell
```bash
docker compose exec api sh
docker compose exec web sh
docker compose exec postgres sh
```
