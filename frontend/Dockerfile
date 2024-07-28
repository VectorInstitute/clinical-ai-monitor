# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG FRONTEND_PORT
ARG BACKEND_PORT
ARG BACKEND_HOST
ENV NEXT_PUBLIC_FRONTEND_PORT=${FRONTEND_PORT}
ENV NEXT_PUBLIC_BACKEND_PORT=${BACKEND_PORT}
ENV NEXT_PUBLIC_BACKEND_HOST=${BACKEND_HOST}

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

ARG FRONTEND_PORT
ENV NEXT_PUBLIC_FRONTEND_PORT=${FRONTEND_PORT}

EXPOSE ${FRONTEND_PORT}

CMD ["npm", "start"]