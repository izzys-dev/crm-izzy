FROM node:18-alpine

WORKDIR /app

# Instalar dependencias backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install 2>/dev/null || true

# Copiar código backend
COPY backend/server.js ./backend/

# Crear carpeta public
RUN mkdir -p /app/backend/public

# Copiar TODOS los archivos del frontend (src + public) a public
COPY frontend/public /app/backend/public/
COPY frontend/src /app/backend/public/

EXPOSE 3001

# Iniciar backend
CMD ["node", "backend/server.js"]
