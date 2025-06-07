# Use an official Node.js runtime as a parent image (LTS version)
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app/server

# Copy package.json and package-lock.json (or yarn.lock if you use Yarn)
COPY package*.json ./

# Install app dependencies
# If you use yarn, replace with: COPY yarn.lock ./ \n RUN yarn install --frozen-lockfile
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Expose the port the app runs on
# Update this if your server runs on a different port
EXPOSE 5000

# Define the command to run the app
# Ensure your package.json has a "start" script for production, e.g., "node server.js"
CMD [ "npm", "start" ]
