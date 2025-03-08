# Use Node.js for the backend
FROM node:16

WORKDIR /app

# Copy backend files and install dependencies
COPY backend/package.json backend/package-lock.json ./
RUN npm install

# Copy backend source code
COPY backend ./

# Set environment variables for MongoDB
ENV MONGODB_URI=mongodb://mongo:27017/budgetDatabase

# Expose port 8000 for the backend
EXPOSE 8000

# Start the backend server
CMD ["node", "budgetPlannerServer.js"]