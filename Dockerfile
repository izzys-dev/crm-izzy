FROM node:18-alpine

WORKDIR /app

# Instalar backend solamente
COPY backend/package.json ./backend/
RUN cd backend && npm install

# Copiar backend
COPY backend/server.js ./backend/

# Copiar frontend estáticos
RUN mkdir -p /app/backend/public
COPY frontend/public /app/backend/public/
COPY frontend/src /app/backend/public/

EXPOSE 3001

CMD ["node", "backend/server.js"]

