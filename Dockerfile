# Stage 1: Build
FROM node:25-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:25-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
RUN npx prisma generate

EXPOSE 3000
CMD ["node", "dist/server.js"]
