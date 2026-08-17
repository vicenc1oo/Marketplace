# --- Build stage ---
# Use Node only to install dependencies and build the React/Vite app.
FROM node:20-alpine AS build

# Work inside /app in the temporary build container.
WORKDIR /app


# Copy package files first so Docker can cache npm install layers.
COPY package*.json ./

# Install dependencies from package-lock.json.
RUN npm ci

# Values used by Vite at build time.
# The browser will call the same Nginx origin, and Nginx will proxy /api and /socket.io.
ARG VITE_API_URL=/api
ARG VITE_WS_URL=/
ARG VITE_USE_MOCKS=false

# Copy the rest of the frontend source code.
COPY . .

# Build the production static files into /app/dist.
RUN npm run build

# --- Serve stage ---
# Use Nginx to serve the compiled React files.
FROM nginx:1.27-alpine

# Copy the Nginx configuration for HTTPS, React fallback, API proxy and WebSocket proxy.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the React build output from the build stage into Nginx's public folder.
COPY --from=build /app/dist /usr/share/nginx/html

# Document the ports used inside the container.
# 80 is used for HTTP redirect, 443 is used for HTTPS.
EXPOSE 80 443

# Start Nginx in the foreground so Docker keeps the container running.
CMD ["nginx", "-g", "daemon off;"]
