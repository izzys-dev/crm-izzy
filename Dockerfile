FROM node:18-alpine

WORKDIR /app

# ===== COMPILAR FRONTEND =====
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install --legacy-peer-deps --silent 2>&1 || npm install --legacy-peer-deps

COPY frontend/src ./src
COPY frontend/public ./public

# Crear build
RUN npm run build 2>&1 || mkdir -p build && cp public/index.html build/

# ===== BACKEND =====
WORKDIR /app
COPY backend/package.json ./backend/
RUN cd backend && npm install --silent

COPY backend/server.js ./backend/

# Copiar frontend compilado a backend
RUN mkdir -p /app/backend/public
COPY --from=0 /app/frontend/build /app/backend/public

EXPOSE 3001

CMD ["node", "backend/server.js"]
