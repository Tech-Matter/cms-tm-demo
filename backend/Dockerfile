FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src ./src
COPY .env.example ./.env

# Create required dirs
RUN mkdir -p /app/data /app/uploads

EXPOSE 4000

CMD ["node", "src/index.js"]
