# ---------------------------
# Stage 1: Build Frontend
# ---------------------------
  FROM node:18-alpine AS client-builder

  WORKDIR /app/client
  
  # Copy client package files and install deps
  COPY client/package*.json ./
  RUN npm install --legacy-peer-deps
  
  # Copy client source and build
  COPY client/ .
  RUN npm run build
  
  
  # ---------------------------
  # Stage 2: Build Backend
  # ---------------------------
  FROM node:18-alpine AS server-builder
  
  WORKDIR /app/web
  
  # Copy backend package files and install deps
  COPY package*.json ./
  RUN npm install --production --legacy-peer-deps
  
  # Copy backend source
  COPY . .
  
  # Copy built frontend into backend's static folder
  COPY --from=client-builder /app/client/dist ./client-dist
  
  
  # ---------------------------
  # Stage 3: Production Image
  # ---------------------------
  FROM node:18-alpine
  
  WORKDIR /app
  
  # Copy server with frontend build
  COPY --from=server-builder /app/web .
  
  # Expose backend port
  EXPOSE 3000
  
  # Start backend (app.js in /web)
  CMD ["node", "app.js"]
  