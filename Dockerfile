# 1) Build client (run inside /app/client)
FROM node:20-bookworm-slim AS client-build
WORKDIR /app/client
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git && rm -rf /var/lib/apt/lists/*

COPY client/package.json client/package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY client/. ./
RUN npm run build

# 2) Server runtime
FROM node:20-bookworm-slim AS server
WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts; else npm install --omit=dev --ignore-scripts; fi

COPY app.js ./app.js
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY docs ./docs
COPY scripts ./scripts
COPY create_user.js ./create_user.js

COPY --from=client-build /app/client/dist ./client-dist

RUN apt-get purge -y build-essential python3 && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

USER node
EXPOSE 4000
CMD ["node", "app.js"]