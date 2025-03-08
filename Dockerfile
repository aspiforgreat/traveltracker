# Stage 1: Build React Frontend
FROM node:16 as frontend-builder

WORKDIR /app/frontend

# Install dependencies separately for better caching
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

# Copy frontend source code
COPY frontend ./

# Build the React app
RUN npm run build

# Stage 2: Serve React App using Nginx
FROM nginx:alpine

# Copy custom Nginx config
COPY /frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from the previous stage
COPY --from=frontend-builder /app/frontend/build /usr/share/nginx/html

# Expose port Nginx listens on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]