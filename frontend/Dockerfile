# 1. Building the React App
FROM node:22.15.1-alpine AS build

WORKDIR /app

# Cache and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and compile
COPY . .
RUN npm run build

# 2. Serving with Nginx
FROM nginx:1.28.3-alpine-slim

# Copy dist folder
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite default nginx routing file
COPY sibeisafe.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
