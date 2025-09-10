# OT Shield - OT Security Dashboard Frontend

This is a Next.js frontend for an Operational Technology (OT) security MVP. The application provides a clean, modern, and professional interface for simulating OT events and monitoring system health and alerts.

## How to Run The Application

The only supported way to run this application is using Docker Compose, which manages the database, backend, and frontend services together.

### Prerequisites

- Docker and Docker Compose are installed.
- You are in the root directory of the project (`/home/sparsh/Desktop/COL/SEM 7/PE/otsec/`).

### 1. Project Structure

Ensure your project folders are organized exactly like this:

```
otsec/
├── backend/
│   ├── Dockerfile
│   └── ... (backend files)
├── anotherFrontend/  (This is your Next.js project folder)
│   ├── Dockerfile
│   └── ... (frontend files)
└── infra/
    └── docker-compose.yml
```

### 2. The `docker-compose.yml` File

Your `docker-compose.yml` file, located at `infra/docker-compose.yml`, must contain the following content. This version includes health checks and the correct build paths.

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=otsec
    ports:
      - '5432:5432'
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d otsec"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ../backend 
    restart: always
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://postgres:postgres@db:5432/otsec
      - BACKEND_PORT=8080
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ../anotherFrontend
      args:
        # This tells the frontend where to find the backend API inside Docker.
        NEXT_PUBLIC_API_BASE: http://backend:8080
    restart: always
    ports:
      - "9002:3000" # Exposes frontend on port 9002
    depends_on:
      - backend

volumes:
  db_data:
```

### 3. Run Docker Compose

From the root directory (`/home/sparsh/Desktop/COL/SEM 7/PE/otsec/`), run this single command:

```bash
sudo docker compose -f infra/docker-compose.yml up --build
```

Docker will build all the services and start them. Once it's done, your **frontend application will be available at http://localhost:9002**.

### 4. Stopping the Application

To stop all services, press `Ctrl + C` in the terminal where Docker Compose is running, then run:
```bash
sudo docker compose -f infra/docker-compose.yml down
```
This will stop and remove the containers.

