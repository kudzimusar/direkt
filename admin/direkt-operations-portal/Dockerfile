# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS dependencies
WORKDIR /srv/direkt-portal

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM dependencies AS build
ARG NEXT_PUBLIC_APP_ENV=staging-synthetic
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_PUBLIC_APP_ENV=${NEXT_PUBLIC_APP_ENV}

COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
LABEL org.opencontainers.image.title="DIREKT Operations Portal" \
      org.opencontainers.image.description="IAM-protected synthetic-only DIREKT operations portal" \
      org.opencontainers.image.source="https://github.com/kudzimusar/direkt"

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
WORKDIR /srv/direkt-portal

COPY --from=build --chown=node:node /srv/direkt-portal/public ./public
COPY --from=build --chown=node:node /srv/direkt-portal/.next/standalone ./
COPY --from=build --chown=node:node /srv/direkt-portal/.next/static ./.next/static

USER node
EXPOSE 8080

CMD ["node", "server.js"]
