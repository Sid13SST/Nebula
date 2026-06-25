FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

# Copy package configurations
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Build backend
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=3000

# To save memory on free tiers, disable dev shm
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
# The browser manager will need to be configured to handle low memory, but we will start the app normally.

CMD ["npm", "start"]
