# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first to leverage Docker layer caching.
COPY package*.json ./
RUN npm ci

# Build the production bundle. VITE_* values can be injected at build time:
#   docker build --build-arg VITE_API_URL=... --build-arg VITE_USE_MOCKS=false .
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_USE_MOCKS
COPY . .
RUN npm run build

# --- Serve stage ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
