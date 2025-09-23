# Backend - StackOverflow Clone

API REST de Express.js para el clon de StackOverflow.

## Inicio Rápido

```bash
# Desde la carpeta server/
docker-compose up -d
```

## Acceso

- Backend API: http://localhost:8080

## Variables de Entorno

Configura las variables en `.env`:

```
DATABASE_URL=mongodb+srv://odiador:pNgJ4JoYh6vvnUDU@amaflow.wqpncyw.mongodb.net/?retryWrites=true&w=majority&appName=amaflow
JWT_SECRET=tu_secreto_jwt_seguro_aqui
PORT=8080
MISTRAL_API_KEY=rApfG0rJ26F7Lq7vsHjKMDHQVAKiN2sA
```

## Base de Datos

Utiliza MongoDB Atlas. No requiere configuración local de MongoDB.

## Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Detener
docker-compose down

# Reconstruir
docker-compose up -d --build
```