# Marketplace

A full-stack marketplace application for publishing listings, buying and selling
items, auctions, chat, notifications, wallets and paid promotions.

## Tech stack

- **Frontend:** React 18, Vite and Socket.IO Client
- **Backend:** Node.js, Express and Socket.IO
- **Database:** PostgreSQL 16
- **Production frontend:** Nginx with local HTTPS
- **Development environment:** Docker Compose and Make

## Requirements

For the recommended Docker setup:

- Docker with the Compose plugin
- GNU Make
- OpenSSL (used to generate the local HTTPS certificate)

For local frontend development, Node.js 20+ and npm are also required.

## Environment configuration

The project uses at most two local environment files:

| File | Used by | Required when |
| --- | --- | --- |
| `.env` | Docker Compose and the backend | Running with Docker or running the backend |
| `frontend/.env` | Vite | Running the frontend locally with `npm run dev` |

`backend/.env` is not used and can be removed. The backend explicitly loads the
root `.env`, while Docker Compose also passes that file to the backend container.

Create the shared root configuration from its template:

```bash
cp .env.example .env
```

The template contains:

```dotenv
NODE_ENV=development
BACKEND_PORT=3000
API_PREFIX=/api
CORS_ORIGIN=https://localhost:8443

DB_HOST=postgres
DB_PORT=5432
DB_NAME=marketplace
DB_USER=marketplace
DB_PASSWORD=choose_a_password

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN_SECONDS=604800
```

Do not commit real secrets. Local `.env` files are ignored by Git; only the
`.env.example` templates should be committed.

## Run with Docker (recommended)

From the repository root:

```bash
make up
```

This command generates a self-signed HTTPS certificate when needed, builds the
images, and starts PostgreSQL, the backend and the frontend. Open:

- **Frontend:** <https://localhost:8443>
- **HTTP redirect:** <http://localhost:8080>
- **Backend API:** <http://localhost:3000/api>
- **Health check:** <http://localhost:3000/health>

The browser will warn about the self-signed development certificate the first
time. Accept the warning to open the application locally.

`make up` keeps the logs attached to the terminal. To run in the background:

```bash
docker compose up --build -d
```

## Mock data

The frontend contains an in-memory mock layer in
`frontend/src/services/mock/`. The sample dataset is defined in
`frontend/src/services/mock/db.js`.

For the Docker build, configure the frontend build argument in
`docker-compose.yml`:

```yaml
args:
  VITE_API_URL: /api
  VITE_WS_URL: /
  VITE_USE_MOCKS: "true"
```

Then rebuild the frontend:

```bash
make down
make up
```

In mock mode, any email and password can be used to sign in. Changes are kept
only in browser memory and are reset when the page is reloaded. WebSocket
features do not connect to the backend in this mode.

To test the real backend, set `VITE_USE_MOCKS` to `"false"` and rebuild.

## Database setup

After the containers are running, create the schema:

```bash
make db-migrate
```

Populate the database with development data:

```bash
make db-seed
```

Run both steps for a new database:

```bash
make db-setup
```

The seed command adds users, categories, wallets, promotion packages, listings
and reviews. Database data is stored in the `postgres_data` Docker volume.

## Local frontend development

Use this workflow for Vite hot reload instead of the Nginx Docker frontend:

```bash
cd frontend
npm ci
npm run dev
```

Open <http://localhost:5173>. First create the local frontend configuration:

```bash
cp frontend/.env.example frontend/.env
```

Its values should normally be:

```dotenv
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000
VITE_USE_MOCKS=true
```

Vite variables are embedded at build time, so changing one requires restarting
the development server or rebuilding the Docker image.

## Useful commands

| Command | Description |
| --- | --- |
| `make up` | Build and start all services |
| `make down` | Stop and remove the containers |
| `make logs` | Follow logs from all services |
| `make restart` | Restart all services |
| `make build` | Generate certificates and build images |
| `make db-migrate` | Apply SQL migrations |
| `make db-seed` | Insert all development seed data |
| `make db-setup` | Apply migrations and insert seed data |
| `make fclean` | Remove containers and volumes, including database data |
| `make re` | Remove containers/volumes and rebuild everything |

> **Warning:** `make fclean` and `make re` delete the PostgreSQL Docker volume.

## Project structure

```text
.
├── backend/
│   ├── src/config/       # Environment, database and socket configuration
│   ├── src/db/           # SQL migrations and seed scripts
│   ├── src/features/     # Domain controllers, services, models and routes
│   └── src/middleware/   # Authentication, rate limiting and error handling
├── frontend/
│   ├── src/components/   # Reusable UI components
│   ├── src/context/      # Authentication, socket, currency, theme and toasts
│   ├── src/pages/        # Application screens
│   ├── src/services/     # API clients and mock implementations
│   └── nginx.conf        # HTTPS, API proxy and SPA routing
├── docker-compose.yml
└── Makefile
```

## Troubleshooting

### `localhost:5173` does not open

Port `5173` is only available when `npm run dev` is running inside `frontend/`.
When using `make up`, open <https://localhost:8443> instead.

### Check container status and logs

```bash
docker compose ps
make logs
```

### Frontend changes are not visible in Docker

The Docker frontend is a static production build. Rebuild it after source code
or `VITE_*` configuration changes:

```bash
docker compose up --build -d frontend
```

### Reset the development database

```bash
make fclean
make up
make db-setup
```

This permanently removes the existing local Docker database before recreating
it.
