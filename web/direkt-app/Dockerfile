# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS dependencies
WORKDIR /srv/direkt/web/direkt-app

COPY web/direkt-app/package.json web/direkt-app/package-lock.json ./
RUN npm ci --ignore-scripts

FROM dependencies AS build
ENV NEXT_TELEMETRY_DISABLED=1 \
    DIREKT_WEB_API_MODE=disabled

WORKDIR /srv/direkt
COPY web/direkt-app ./web/direkt-app
COPY backend/direkt-api/src/discovery/discovery.types.ts ./backend/direkt-api/src/discovery/discovery.types.ts
COPY backend/direkt-api/src/discovery/discovery.dto.ts ./backend/direkt-api/src/discovery/discovery.dto.ts
COPY backend/direkt-api/src/interaction/review.types.ts ./backend/direkt-api/src/interaction/review.types.ts
WORKDIR /srv/direkt/web/direkt-app
RUN npm run typecheck \
    && npm run verify:static \
    && npm run verify:discovery \
    && npm run build

FROM node:24-bookworm-slim AS runtime
LABEL org.opencontainers.image.title="DIREKT Customer Provider Web" \
      org.opencontainers.image.description="IAM-private synthetic-only DIREKT customer/provider W2 canary" \
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
