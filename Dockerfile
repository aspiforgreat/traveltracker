# Stage 1: Build React Frontend
FROM node:16 as frontend-builder

WORKDIR /app/frontend

# Install dependencies
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy frontend code and build the app
COPY frontend ./
RUN npm run build

# Stage 2: Serve React app using Nginx
FROM nginx:alpine

# Copy the build files from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html

# Expose the port Nginx will listen on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]