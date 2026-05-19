# Stage: Development (hot reload)
FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source (will be overridden by volume mount in dev)
COPY . .

EXPOSE 3001

# Default dev command with hot reload via nodemon
CMD ["npm", "run", "dev"]
