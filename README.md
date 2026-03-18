# PrimeTrade Backend Developer (Intern) Assignment

A scalable REST API with JWT Authentication, Role-Based Access Control, and full CRUD functionality, built with a modern React frontend dashboard.

## Tech Stack
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL (Docker)
- **Frontend**: React, Vite, TailwindCSS
- **Security & Validation**: JWT Auth, Bcrypt Hashing, Zod schema validation

## Scalability Note
To scale this application for production use cases with higher traffic:
1. **Microservices Architecture**: The monolithic Node.js app can be split into smaller independently deployable microservices (e.g., an Auth Service and a Task Service) communicating over gRPC or message queues (RabbitMQ/Kafka).
2. **Caching**: Implementing Redis caching for frequently accessed end-points (like `GET /api/v1/tasks`) would drastically optimize database queries.
3. **Database Scaling**: Implement read replicas for PostgreSQL and ensure proper indexing on frequently queried columns (`user_id`, `email`).
4. **Load Balancing**: Deploy behind an AWS ALB or NGINX proxy to balance HTTP load across multiple backend container instances.
5. **Horizontal Pod Autoscaling**: Orchestrating deployments using Kubernetes (K8s) to automatically spin up new pods during traffic surges.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### 1. Database Setup
```sh
# Start the PostgreSQL database
docker compose up -d
```

### 2. Backend Setup
```sh
cd backend
npm install

# Push Drizzle schema to PostgreSQL
npm run db:push

# Start the dev server
npm run dev
```

### 3. Frontend Setup
```sh
cd frontend
npm install

# Start the frontend dev server
npm run dev
```

## API Documentation
The REST API is organized logically under `/api/v1/auth` and `/api/v1/tasks`.

### Auth Endpoints
- `POST /api/v1/auth/register`: `{ name, email, password, role }`
- `POST /api/v1/auth/login`: `{ email, password }`

### Tasks Endpoints (Requires `Authorization: Bearer <token>`)
- `POST /api/v1/tasks`: `{ title, description }`
- `GET /api/v1/tasks`: Returns list of tasks (Admin sees all, Users see their own)
- `GET /api/v1/tasks/:id`: Get a specific task
- `PUT /api/v1/tasks/:id`: Update a task ` { title, description, isCompleted }`
- `DELETE /api/v1/tasks/:id`: Delete a task
