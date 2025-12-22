FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./

COPY apps/api/package*.json ./apps/api/
COPY packages/common/package*.json ./packages/common/

RUN npm install

COPY . .

RUN npm run build --workspace=@repo/common 
RUN npm run build --workspace=api          

FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./

COPY apps/api/package*.json ./apps/api/
COPY packages/common/package*.json ./packages/common/

RUN npm ci --omit=dev

FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist

COPY --from=builder /app/apps/api/drizzle ./drizzle
COPY --from=builder /app/apps/api/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

COPY --from=builder /app/packages ./packages

COPY --from=builder /app/apps/api/package*.json ./

COPY --from=deps /app/node_modules ./node_modules

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000

ENTRYPOINT [ "./docker-entrypoint.sh" ]
CMD ["node", "dist/src/main.js"]