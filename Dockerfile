# Use multi-stage build for efficiency
# Stage 1: Build React Frontend
FROM node:16 as frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend ./
RUN npm run build

# Stage 2: Set up Backend + MongoDB
FROM node:16
WORKDIR /app

# Copy backend files
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# Copy backend source code
COPY backend ./

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Set environment variables (MongoDB URI should be updated)
ENV MONGODB_URI=mongodb://mongo:27017/mydb

# Expose ports
EXPOSE 8000

# Start the backend server
CMD ["node", "budgetPlannerServer.js"]
