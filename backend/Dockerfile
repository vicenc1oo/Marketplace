# Use a small Node.js image as the runtime for the backend.
FROM node:20-alpine

# Set the working directory inside the container.
# All following commands run from /app.
WORKDIR /app

# Copy package files first so Docker can cache dependency installation.
COPY package*.json ./

# Install backend dependencies.
RUN npm ci

# Copy the backend source code into the container.
COPY . .

# Document the port used by the Express server inside the container.
EXPOSE 3000

# Apply idempotent schema migrations before accepting API requests.
CMD ["sh", "-c", "npm run db:migrate && npm start"]