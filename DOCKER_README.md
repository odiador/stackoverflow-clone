# StackOverflow Clone - Docker Setup

Este proyecto incluye configuración de Docker separada para frontend y backend.

## Estructura

- `client/docker-compose.yml` - Configuración Docker para el frontend (Next.js)
- `server/docker-compose.yml` - Configuración Docker para el backend (Express.js)

## Inicio Rápido

1. **Inicia el backend:**
   ```bash
   cd server
   docker-compose up -d
   ```

2. **Inicia el frontend:**
   ```bash
   cd client
   docker-compose up -d
   ```

3. **Accede a la aplicación:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## Servicios

### Backend (Express.js)
- **Node.js:** 16-bullseye (compatible con legacy OpenSSL)
- **Puerto:** 8080
- **Base de datos:** MongoDB Atlas (no requiere configuración local)
- **Características:** API REST, autenticación JWT, moderación de IA

### Frontend (Next.js)
- **Node.js:** 16-bullseye (compatible con legacy OpenSSL)
- **Puerto:** 3000
- **Framework:** Next.js 11.1.4 + React 17
- **Características:** SSR, markdown rendering, streaming AI responses

## Variables de Entorno

### Backend (.env en server/)
```
DATABASE_URL=mongodb+srv://... (MongoDB Atlas)
JWT_SECRET=tu_secreto_jwt_seguro_aqui
PORT=8080
MISTRAL_API_KEY=tu_clave_de_mistral_ai
```

### Frontend (.env en client/)
```
SITE_NAME=http://localhost:8080/api
```

## Comandos Útiles

```bash
# Backend
cd server
docker-compose logs -f backend
docker-compose down

# Frontend
cd client
docker-compose logs -f frontend
docker-compose down

# Reconstruir ambos
cd server && docker-compose up -d --build
cd client && docker-compose up -d --build
```

## Desarrollo

Los contenedores están configurados con hot-reload para desarrollo. Los cambios en el código se reflejarán automáticamente.

## Producción

Para producción, considera:
1. Cambiar las credenciales por defecto
2. Usar imágenes más específicas de Node.js
3. Configurar nginx como reverse proxy
4. Usar secrets de Docker para credenciales sensibles