ARG NODE_VERSION=24.13.0-slim
ARG NGINXINC_IMAGE_TAG=alpine3.22

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

COPY package.json package-lock.json* .npmrc* ./
COPY turbo.json ./

COPY apps/web/package*.json ./apps/web/
COPY packages/ui/package*.json ./packages/ui/

# Install project dependencies with frozen lockfile for reproducible builds
RUN --mount=type=cache,target=/root/.npm \
  npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

ENV NODE_ENV=production

RUN --mount=type=cache,target=/app/apps/web/.next/cache \
  npm run build --workspace=web

FROM nginxinc/nginx-unprivileged:${NGINXINC_IMAGE_TAG} AS runner

WORKDIR /app

RUN echo 'worker_processes 1; \
pid /tmp/nginx.pid; \
events { \
    worker_connections 1024; \
} \
http { \
    include       /etc/nginx/mime.types; \
    default_type  application/octet-stream; \
    access_log /dev/stdout; \
    error_log  /dev/stderr; \
    sendfile        on; \
    tcp_nopush      on; \
    tcp_nodelay     on; \
    keepalive_timeout  65; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    gzip_min_length 256; \
    server { \
        listen       8080; \
        server_name  localhost; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $uri $uri.html $uri/ =404; \
        } \
        location ~ ^/(.+)/$ { \
            rewrite ^/(.+)/$ /$1.html break; \
        } \
        location ~ ^/_next/ { \
            try_files $uri =404; \
            expires 1y; \
            add_header Cache-Control "public, immutable"; \
        } \
        error_page 404 /404.html; \
        location = /404.html { \
            internal; \
        } \
    } \
} \
' > /etc/nginx/nginx.conf

COPY --from=builder /app/apps/web/out /usr/share/nginx/html

USER nginx

EXPOSE 8080

CMD ["nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
