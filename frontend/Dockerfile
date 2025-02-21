# Step 1: Build the React app
FROM node:16 as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Build the React app for production
RUN npm run build

# Step 2: Serve the build using Nginx
FROM nginx:alpine

# Copy the build from the previous stage to the Nginx directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
