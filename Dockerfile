FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Production stage
FROM node:20-alpine AS runtime

WORKDIR /app


# Create non-root user
RUN addgroup --system --gid 1001 astro
RUN adduser --system --uid 1001 astro

# Copy built application
COPY --from=builder --chown=astro:astro /app/dist ./dist
COPY --from=builder --chown=astro:astro /app/node_modules ./node_modules
COPY --from=builder --chown=astro:astro /app/package.json ./package.json

# Switch to non-root user
USER astro

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000
CMD ["node", "./dist/server/entry.mjs"]