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

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the API port
EXPOSE 3000

# Use entrypoint to run migrations before starting the app
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "index.js"]
