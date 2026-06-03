# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Non-root user for security (OWASP requirement)
RUN addgroup -S nodeuser && adduser -S nodeuser -G nodeuser

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER nodeuser

EXPOSE 3001
CMD ["npm", "start"]

# Development stage (used by docker-compose)
FROM node:18-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm install
# We'll mount the code via volume in docker-compose, so no need to COPY . .
# We just need to start the dev server
CMD ["npm", "run", "dev"]
