# Use an official Node runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /frontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your React code into the container
COPY . .

# Build the React application
RUN npm run build

RUN npm install -g serve

# Serve the application
CMD ["serve", "-s", "build"]
