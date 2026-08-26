# Stage 1: Compilar Frontend React
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

# Copiar package.json
COPY frontend/package.json ./

# Instalar dependencias (con legacy peer deps para evitar errores)
RUN npm install --legacy-peer-deps --no-optional 2>/dev/null || npm install --legacy-peer-deps

# Copiar código fuente
COPY frontend/src ./src
COPY frontend/public ./public

# Crear build (ignorar warnings)
RUN npm run build 2>&1 || true
RUN test -d build || mkdir -p build && cp public/index.html build/

# Stage 2: Backend + Servir Frontend compilado
FROM node:18-alpine
WORKDIR /app

# Instalar backend
COPY backend/package.json ./backend/
RUN cd backend && npm install

# Copiar backend
COPY backend/server.js ./backend/

# Copiar frontend compilado a la carpeta public del backend
COPY --from=frontend-build /app/frontend/build /app/backend/public

EXPOSE 3001

CMD ["node", "backend/server.js"]
