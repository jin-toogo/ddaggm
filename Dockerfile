FROM node:18 AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image
FROM node:18-slim AS runner

WORKDIR /app
# Environment variables
ENV NODE_ENV=production


# Copy necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]