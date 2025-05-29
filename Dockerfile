# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy root package.json files if any
COPY package*.json ./

# Copy backend package.json files for dependency install
COPY backend/package*.json ./backend/

# Copy frontend package.json files for dependency install
COPY frontend/package*.json ./frontend/

# Install Node.js dependencies
RUN npm install
RUN npm --prefix backend install
RUN npm --prefix frontend install

# Copy the rest of your project files into the container
COPY . .

# Set a MongoDB server
ENV MONGO_URL="mongodb://172.0.0.11:27017,172.0.0.12:27017,172.0.0.13:27017,172.0.0.14:27017,172.0.0.15:27017/?replicaSet=myReplicaSet"

# Expose the port that your application runs on
EXPOSE 3000

# Define the command to run your Node.js application
CMD ["npm", "start"]