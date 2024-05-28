ARG NODE_VERSION=lts-slim

FROM node:${NODE_VERSION} AS dependencies

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=/app/pnpm-lock.yaml \
    corepack enable && \
    pnpm install --frozen-lockfile --strict-peer-dependencies

FROM dependencies AS builder

RUN pnpm build && pnpm prune --prod

FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist .

EXPOSE ${PORT}

CMD ["main.js"]
