# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/client
COPY Cinemate-main/cinema-main/package*.json ./
RUN npm install
COPY Cinemate-main/cinema-main/ ./
ENV CI=false
RUN npm run build

# Stage 2: Production Server
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy server code
COPY server/ ./server/

# Copy built React frontend to expected static directory
COPY --from=frontend-builder /app/client/build ./Cinemate-main/cinema-main/build

EXPOSE 5000
CMD ["node", "server/src/server.js"]
