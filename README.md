# Bijou Coquettee - PostgreSQL Docker Setup

This project includes a Docker Compose setup for PostgreSQL database with PgAdmin for database management.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Copy the environment file:**
   ```bash
   cp env.example .env
   ```

2. **Update the `.env` file with your actual password:**
   ```bash
   # Edit .env file and replace 'your_password_here' with your actual password
   POSTGRES_PASSWORD=your_actual_password
   ```

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify the services are running:**
   ```bash
   docker-compose ps
   ```

## Services

### PostgreSQL Database
- **Host:** localhost
- **Port:** 5432
- **Username:** bijou-coquettee
- **Password:** (as set in .env file)
- **Database:** bijou-coquettee

### PgAdmin (Database Management)
- **URL:** http://localhost:8080
- **Email:** admin@bijou-coquettee.com
- **Password:** admin123

## Database Connection

To connect to the PostgreSQL database from your application, use these connection details:

```
Host: localhost
Port: 5432
Username: bijou-coquettee
Password: (your password from .env)
Database: bijou-coquettee
```

## Useful Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs postgres
docker-compose logs pgadmin
```

### Access PostgreSQL shell
```bash
docker-compose exec postgres psql -U bijou-coquettee -d bijou-coquettee
```

### Reset database (WARNING: This will delete all data)
```bash
docker-compose down -v
docker-compose up -d
```

## Data Persistence

The PostgreSQL data is persisted in a Docker volume named `postgres_data`. This means your data will survive container restarts and updates.

## Security Notes

- Change the default PgAdmin password in production
- Use strong passwords for the PostgreSQL user
- Consider using Docker secrets for production deployments
- The `.env` file is gitignored for security

## Troubleshooting

### Port conflicts
If port 5432 or 8080 are already in use, you can change them in the `docker-compose.yml` file.

### Permission issues
On some systems, you might need to run:
```bash
sudo chown -R $USER:$USER postgres_data/
```

### Reset everything
To completely reset the setup:
```bash
docker-compose down -v
docker system prune -f
docker-compose up -d
```
