# Stage 1: Build the React application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app/client

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
# If you use yarn, replace with: COPY yarn.lock ./ \n RUN yarn install --frozen-lockfile
RUN npm install

# Copy the rest of the client application files
COPY . .

# Build the React application for production
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.25-alpine

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage to Nginx public folder
COPY --from=builder /usr/src/app/client/build /usr/share/nginx/html

# Copy custom Nginx configuration
# We will create this nginx.conf file next if it doesn't exist,
# or you can provide one. For now, we'll assume a basic one.
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# A simple default config to handle SPA routing:
# A super simple default config for debugging Nginx
RUN echo "server { listen 80; server_name localhost; root /usr/share/nginx/html; index index.html; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
