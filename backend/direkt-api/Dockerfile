# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS dependencies
WORKDIR /srv/direkt

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

FROM dependencies AS build
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build \
  && npm prune --omit=dev

FROM node:24-bookworm-slim AS runtime
LABEL org.opencontainers.image.title="DIREKT API" \
      org.opencontainers.image.description="Synthetic-first DIREKT backend API" \
      org.opencontainers.image.source="https://github.com/kudzimusar/direkt"
ENV NODE_ENV=production \
    PORT=8080
WORKDIR /srv/direkt

COPY --from=build --chown=node:node /srv/direkt/package.json ./package.json
COPY --from=build --chown=node:node /srv/direkt/package-lock.json ./package-lock.json
COPY --from=build --chown=node:node /srv/direkt/node_modules ./node_modules
COPY --from=build --chown=node:node /srv/direkt/dist ./dist

USER node
EXPOSE 8080

CMD ["node", "dist/main.js"]
