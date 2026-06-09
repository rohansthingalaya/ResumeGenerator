# ── Stage 1: Build Vite frontend ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# ── Stage 2: Production image ─────────────────────────────────────────────────
FROM node:20-slim AS production

# LibreOffice — primary PDF converter (DOCX → PDF)
# Puppeteer system libs — fallback PDF converter (HTML → PDF)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install production backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend source and built frontend
COPY backend/ ./backend/
COPY --from=builder /app/frontend/dist ./frontend/dist

# Persistent data directory (mount a volume here to survive container restarts)
RUN mkdir -p data

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
