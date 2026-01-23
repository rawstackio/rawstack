# ============================================
# 1. Build Stage
# ============================================
FROM --platform=linux/amd64 node:22-alpine AS build

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY prisma ./prisma/
COPY prisma.config.ts ./

# Set a placeholder DATABASE_URL for prisma generate (not used at build time)
ENV DATABASE_URL="postgresql://buildtime-placeholder/buildtime"

RUN yarn prisma generate

COPY . .

RUN yarn run build

# ============================================
# 2. Final Runtime Image
# ============================================
FROM --platform=linux/amd64 node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl
RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

# Copy prisma schema and generated client from build stage
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

# Copy built output
COPY --from=build /app/dist ./dist

# Prisma Client runtime artifacts (generated client + query engine)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/src/main"]
