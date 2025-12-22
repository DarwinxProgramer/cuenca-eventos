# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
