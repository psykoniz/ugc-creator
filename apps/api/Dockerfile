FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/prompts/package.json packages/prompts/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

# Build shared packages and API
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared/ packages/shared/
COPY packages/prompts/ packages/prompts/
COPY apps/api/ apps/api/
RUN pnpm --filter @ugc/shared build && \
    pnpm --filter @ugc/prompts build && \
    pnpm --filter @ugc/api build

# Production image
FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/prompts/node_modules ./packages/prompts/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY --from=build /app/packages/prompts/dist ./packages/prompts/dist
COPY --from=build /app/packages/prompts/package.json ./packages/prompts/
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/drizzle ./apps/api/drizzle

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/index.js"]
