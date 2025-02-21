# Use official Node.js image as the base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies (including nodemon)
COPY package*.json ./
RUN npm install

# Install nodemon globally so it's available in the container
RUN npm install -g nodemon

# Copy the rest of the app's source code
COPY . .

# Expose the API port (default for Express is 3000)
EXPOSE 8000

# Start the Express server with nodemon
CMD ["nodemon", "budgetPlannerServer.js"]
