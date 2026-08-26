FROM node:18 AS builder

WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --legacy-peer-deps

COPY frontend/src ./src
COPY frontend/public ./public

RUN npm run build

# Backend
FROM node:18
WORKDIR /app

COPY backend/package.json ./backend/
RUN cd backend && npm install

COPY backend/server.js ./backend/

# Copiar el build compilado
COPY --from=builder /app/frontend/build /app/backend/public

EXPOSE 3001

CMD ["node", "backend/server.js"]
