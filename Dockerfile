FROM node:18

WORKDIR /app

# Backend
COPY backend/package.json ./backend/
RUN cd backend && npm install

COPY backend/server.js ./backend/

# Frontend estático (sin compilar)
RUN mkdir -p /app/backend/public
COPY frontend/src /app/backend/public/
COPY frontend/public/* /app/backend/public/

EXPOSE 3001

CMD ["node", "backend/server.js"]
