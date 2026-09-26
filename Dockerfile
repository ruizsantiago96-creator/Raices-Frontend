# Stage 1: Builder
FROM node:22-alpine AS builder

# Enable Corepack and activate pnpm 10
RUN corepack enable && corepack prepare pnpm@10.5.2 --activate

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies strictly with frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy application source code
COPY . .

# Build production SPA distribution
RUN pnpm run build

# Stage 2: Runner
FROM nginx:alpine AS runner

# Copy built static assets to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx template for dynamic $PORT substitution by nginx docker entrypoint
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Default PORT for Cloud Run if not specified in environment
ENV PORT=8080

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
