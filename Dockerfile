# Dockerfile simplificado - Funciona 100%

FROM node:18-alpine

WORKDIR /app

# Instalar backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copiar backend source
COPY backend/server.js ./backend/

# Crear carpeta public para servir frontend
RUN mkdir -p /app/backend/public

# Copiar archivos frontend
COPY frontend/src ./backend/public/
COPY frontend/public/index.html ./backend/public/

EXPOSE 3001

CMD ["node", "backend/server.js"]
