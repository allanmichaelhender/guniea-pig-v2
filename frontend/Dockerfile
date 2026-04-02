# Stage 1: Build the React app
FROM node:22-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
# Use the legacy flag we found earlier to prevent version crashes
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve the static files
FROM nginx:stable-alpine
# Copy the finished build from the first stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
