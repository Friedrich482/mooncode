ARG NODE_VERSION=24.13.0-alpine

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./

COPY apps/api/package*.json ./apps/api/
COPY packages/common/package*.json ./packages/common/

RUN npm install

COPY . .

RUN npm run build --workspace=@repo/common 
RUN npm run build --workspace=api          

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

COPY package*.json ./
COPY turbo.json ./

COPY apps/api/package*.json ./apps/api/
COPY packages/common/package*.json ./packages/common/

RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund --omit=dev

FROM node:${NODE_VERSION} AS runner

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist

COPY --from=builder /app/apps/api/drizzle ./drizzle
COPY --from=builder /app/apps/api/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/apps/api/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/packages/trpc ./packages/trpc
COPY --from=builder /app/apps/api/package*.json ./

COPY --from=dependencies /app/node_modules ./node_modules

USER node

EXPOSE 3000

ENTRYPOINT [ "./docker-entrypoint.sh" ]
CMD ["node", "dist/src/main.js"]