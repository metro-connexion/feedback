FROM node:24.9.0-alpine

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application files
COPY . .

# Run database migrations
RUN npm run db:migrate

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
