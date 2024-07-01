# Stage 1: Build the application
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .

# Stage 2: Run the application
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["node", "src/index.js"]

