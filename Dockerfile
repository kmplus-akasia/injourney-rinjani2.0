# Rinjani Integrated: static Vite SPA served by nginx (unprivileged, port 8080).
# Build context = repo root. No runtime env vars: the app is a front-end prototype with mock auth.

FROM node:22-alpine AS build
WORKDIR /repo
# Manifests first so the dependency layer is cached until a package.json / lockfile changes.
COPY package.json package-lock.json ./
COPY apps/rinjani/package.json apps/rinjani/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/shared-ui/package.json packages/shared-ui/package.json
COPY packages/shell/package.json packages/shell/package.json
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/rinjani/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
