# Stage 1: Build NestJS API
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY turbo.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/api/prisma ./apps/api/prisma
RUN npm ci

COPY . .
RUN npx turbo run build --filter=api

# Stage 2: Run NestJS API
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma
# Install production dependencies for the API workspace
RUN npm ci --omit=dev --workspace=api

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/apps/api/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 8000
CMD sh -c "npm run db:migrate --workspace=api && node apps/api/dist/main.js"
