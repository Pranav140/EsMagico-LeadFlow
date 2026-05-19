# Stage: Development (hot reload)
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy source (will be overridden by volume mount in dev)
COPY . .

EXPOSE 5173

# Vite dev server with host binding for Docker access
CMD ["npm", "run", "dev"]
