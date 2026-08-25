# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/src ./src
COPY frontend/public ./public
RUN npm run build

# Stage 2: Backend + Serve Frontend
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy backend source
COPY backend/server.js ./backend/
COPY backend/.dockerignore ./backend/

# Copy compiled frontend to backend public
RUN mkdir -p /app/backend/public
COPY --from=frontend-build /app/frontend/build /app/backend/public

EXPOSE 3001

CMD ["node", "backend/server.js"]
