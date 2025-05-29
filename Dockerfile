# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if you have them)
COPY package*.json ./

# Install Node.js dependencies
RUN npm install
RUN npm --prefix backend install
RUN npm --prefix frontend install

# Copy the rest of your project files into the container
COPY . .

# Set a MongoDB server
ENV MONGO_URI=mongodb://localhost:27017/?directConnection=true&replicaSet=myReplicaSet

# Expose the port that your application runs on
EXPOSE 3000

# Define the command to run your Node.js application
CMD ["npm", "start"]