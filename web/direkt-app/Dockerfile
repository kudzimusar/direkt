# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS dependencies
WORKDIR /srv/direkt/web/direkt-app

COPY web/direkt-app/package.json web/direkt-app/package-lock.json ./
RUN npm ci --ignore-scripts

FROM dependencies AS build
ENV NEXT_TELEMETRY_DISABLED=1 \
    DIREKT_WEB_API_MODE=disabled \
    DIREKT_WEB_AUTH_MODE=disabled

# Keep the repository-relative layout used by the generated-client imports. The
# generated models are source-owned by RC9 and must not be copied or hand-written
# inside the web project merely to make an isolated container build pass.
COPY web/direkt-app/ ./
COPY clients/generated/typescript/ /srv/direkt/clients/generated/typescript/
RUN npm run typecheck \
    && npm run verify:static \
    && npm run build

FROM node:24-bookworm-slim AS runtime
LABEL org.opencontainers.image.title="DIREKT Customer Provider Web" \
      org.opencontainers.image.description="DIREKT customer/provider functional web runtime with private BFF boundaries" \
      org.opencontainers.image.source="https://github.com/kudzimusar/direkt"

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
WORKDIR /srv/direkt-web

COPY --from=build --chown=node:node /srv/direkt/web/direkt-app/public ./public
COPY --from=build --chown=node:node /srv/direkt/web/direkt-app/.next/standalone ./
COPY --from=build --chown=node:node /srv/direkt/web/direkt-app/.next/static ./.next/static

USER node
EXPOSE 8080

CMD ["node", "server.js"]
