# Purple Merit Backend Assessment

This is the submission for the Full Stack Developer Backend Assessment. It is a Real-Time Collaborative Workspace Backend.

## Tech Stack

*   **Runtime**: Node.js, TypeScript
*   **Framework**: Express.js
*   **Databases**: PostgreSQL (Prisma), MongoDB (Mongoose), Redis
*   **Real-Time**: Socket.io (with Redis Adapter)
*   **Queues**: BullMQ
*   **DevOps**: Docker, Docker Compose

## Features

1.  **Authentication**: JWT (Access + Refresh), RBAC.
2.  **Workspaces & Projects**: CRUD operations with role checks.
3.  **Real-Time**: WebSocket events for joining projects, file changes, and cursor movements.
4.  **Async Jobs**: Code execution simulation with retry logic using BullMQ.
5.  **Documentation**: Swagger API docs.

## Setup & Run

### Prerequisites
*   Docker & Docker Compose

### Steps
1.  Clone the repository.
2.  Create a `.env` file (see `.env.example` or use provided defaults).
3.  Run:
    ```bash
    docker-compose up --build
    ```
4.  The server will start on port 3000.

## API Documentation

Once the server is running, visit:
`http://localhost:3000/api/docs`

## Architecture

*   **Clean Architecture**: Controllers -> Services -> Repositories (Prisma/Mongoose).
*   **Scalability**:
    *   **Stateless API**: Can be horizontally scaled behind a load balancer.
    *   **Socket.io**: Uses Redis Adapter to broadcast events across multiple instances.
    *   **BullMQ**: Redis-based queue allows multiple workers to process jobs.

## Testing

Run tests locally:
```bash
npm test
```
