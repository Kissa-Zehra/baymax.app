# frontend/Dockerfile — Baymax AI React Frontend
# DigitalOcean App Platform uses this when source_dir=frontend

FROM node:20-alpine AS build

WORKDIR /app

# Accept VITE_API_URL at build time so the static bundle
# knows where to call the backend API in production
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─── Production stage — serve with nginx ───────────────────
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# SPA fallback: all routes → index.html
RUN printf 'server {\n\
    listen 8080;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
