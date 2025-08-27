FROM node:20-slim

# Install MySQL client for connectivity testing
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose the default MCP port
EXPOSE 3308

# Set environment variables
ENV NODE_ENV=production

# Run the MCP server
CMD ["node", "build/index.js"]
