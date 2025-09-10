# ---------- Builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Keep your lockfile; don't delete it
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Ensure public exists even if your repo doesn't have it
RUN mkdir -p public

# Build Next (generates .next and .next/standalone when output:'standalone')
RUN npm run build

# ---------- Runner ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Set the runtime port; Next's standalone server reads PORT
ENV PORT=9002

# Copy standalone output & assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 9002
CMD ["node", "server.js"]

