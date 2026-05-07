FROM node:20-bookworm-slim AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---- build ----
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- runtime ----
FROM node:20-bookworm-slim AS runtime

RUN apt-get update && apt-get install -y \
  chromium \
  libnss3 \
  libatk-bridge2.0-0 \
  libgtk-3-0 \
  libxss1 \
  libasound2 \
  libgbm1 \
  libxshmfence1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
            /usr/share/doc /usr/share/man /usr/share/locale

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production

WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=build /app/dist ./dist

RUN chown -R node:node /app
USER node

CMD ["node", "dist/server.js"]
