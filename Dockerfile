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

COPY --chown=node:node src/ /app/src

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=/app/pnpm-lock.yaml \
    --mount=type=bind,source=nest-cli.json,target=/app/nest-cli.json \
    --mount=type=bind,source=tsconfig.json,target=/app/tsconfig.json \
    --mount=type=bind,source=tsconfig.build.json,target=/app/tsconfig.build.json \
    pnpm build && \
    pnpm prune --prod --ignore-scripts

FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

ENV PORT=3000

COPY --chown=nonroot:nonroot --from=builder /app/node_modules ./node_modules
COPY --chown=nonroot:nonroot --from=builder /app/dist .
COPY --chown=nonroot:nonroot CHANGELOG.md LICENSE package.json /app/

EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=2s --start-period=10s --retries=2 CMD [ "/nodejs/bin/node", "bin/health-checker.js" ]

CMD ["main.js"]
