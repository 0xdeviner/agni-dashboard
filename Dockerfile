# Production image: builds React client and serves via Express API

# 1) Build client (run inside /app/client)
FROM node:20-bookworm-slim AS client-build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates git && rm -rf /var/lib/apt/lists/*

# Install client deps with scripts enabled (e.g., esbuild/sharp postinstall)
COPY client/package.json client/package-lock.json* ./client/
RUN bash -lc 'cd client && if [ -f package-lock.json ]; then npm ci; else npm install; fi'

# Copy client sources and build
COPY client ./client
RUN bash -lc 'cd client && npm run build'

# 2) Server runtime
FROM node:20-bookworm-slim AS server
WORKDIR /app
ENV NODE_ENV=production

# Tools for native modules (e.g., bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends python3 build-essential ca-certificates && rm -rf /var/lib/apt/lists/*

# Install server deps WITHOUT lifecycle scripts so root postinstall doesn't run
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts; else npm install --omit=dev --ignore-scripts; fi

# Copy server source
COPY app.js ./app.js
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY docs ./docs
COPY scripts ./scripts
COPY create_user.js ./create_user.js

# Bring in the built client
COPY --from=client-build /app/client/dist ./client-dist

# Trim build tools
RUN apt-get purge -y build-essential python3 && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

USER node
EXPOSE 4000
CMD ["node", "app.js"]