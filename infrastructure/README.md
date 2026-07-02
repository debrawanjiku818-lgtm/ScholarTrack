# Infrastructure

This directory contains the infrastructure configuration for the ScholarTrack application.

## Services

- **postgres** - PostgreSQL database (port 5432)
- **app** - Next.js frontend (port 3000)
- **nestjs-api** - NestJS API backend (port 4000)
- **fastapi-engine** - FastAPI engine (port 8000)

## Database

The application uses PostgreSQL as the primary database with RBAC (Role-Based Access Control) support.

### Database Credentials

- **Username:** scholartrack
- **Password:** scholartrack123
- **Database:** scholartrack_db
- **Port:** 5432

### Database Schema

The database includes the following tables:
- `users` - User accounts with roles (student, admin, staff)
- `courses` - Available courses
- `enrollments` - Student course enrollments
- `assignments` - Course assignments
- `submissions` - Student assignment submissions
- `sessions` - Authentication sessions

### RBAC Roles

- **student** - Can enroll in courses, view dashboard, submit assignments
- **admin** - Full system access, manage courses and users
- **staff** - Can grade assignments, view student progress, manage teaching duties

## Docker Compose

To start all services:

```bash
docker-compose up -d
```

To stop all services:

```bash
docker-compose down
```

To view logs:

```bash
docker-compose logs -f
```

To restart specific service:

```bash
docker-compose restart postgres
```

## Database Initialization

The database schema is automatically initialized on first startup using the SQL scripts in the `init-scripts/` directory. This includes:
- Creating all required tables
- Setting up RBAC roles
- Inserting default admin user
- Adding sample courses

## Environment Variables

All services use the following database connection string:
```
DATABASE_URL=postgresql://scholartrack:scholartrack123@postgres:5432/scholartrack_db
```

## Network

All services are connected to the `scholartrack-network` bridge network for inter-service communication.
