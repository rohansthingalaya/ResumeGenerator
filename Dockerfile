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
# Font packages — Microsoft fonts are not available on Linux by default:
#   fonts-liberation   → Liberation Sans (≈Arial), Serif (≈Times New Roman), Mono (≈Courier New)
#   fonts-crosextra-*  → Carlito (metric-compatible Calibri), Caladea (≈Cambria)
#   fonts-freefont-ttf → FreeSerif / FreeSans / FreeMono coverage
# fontconfig rules below alias Georgia/Calibri/Consolas/Helvetica to the installed substitutes
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxfixes3 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 \
    fonts-liberation \
    fonts-crosextra-carlito \
    fonts-crosextra-caladea \
    fonts-freefont-ttf \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Font substitution rules so LibreOffice maps missing Microsoft fonts to installed equivalents
RUN mkdir -p /etc/fonts/conf.d && cat > /etc/fonts/conf.d/99-ms-font-aliases.conf <<'EOF'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <alias><family>Georgia</family><prefer><family>Liberation Serif</family></prefer></alias>
  <alias><family>Calibri</family><prefer><family>Carlito</family></prefer></alias>
  <alias><family>Consolas</family><prefer><family>Liberation Mono</family></prefer></alias>
  <alias><family>Helvetica</family><prefer><family>Liberation Sans</family></prefer></alias>
  <alias><family>Arial</family><prefer><family>Liberation Sans</family></prefer></alias>
  <alias><family>Times New Roman</family><prefer><family>Liberation Serif</family></prefer></alias>
</fontconfig>
EOF
RUN fc-cache -fv

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
