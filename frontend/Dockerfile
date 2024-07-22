# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Build the Next.js app
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Expose the port the app runs on
EXPOSE 8091

# Start the app
CMD ["npm", "start"]
