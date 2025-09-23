# Frontend - StackOverflow Clone

Aplicación Next.js para el frontend del clon de StackOverflow.

## Inicio Rápido

```bash
# Desde la carpeta client/
docker-compose up -d
```

## Acceso

- Frontend: http://localhost:3000

## Variables de Entorno

Configura las variables en `.env`:

```
SITE_NAME=http://localhost:8080/api
```

## Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reconstruir
docker-compose up -d --build
```