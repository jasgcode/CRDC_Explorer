FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy configuration files
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY vite.config.ts ./
COPY index.html ./

# Expose the port
EXPOSE 5173

# Start the app in development mode
CMD ["npm", "run", "dev", "--", "--host"]