# Stage 1: Build the React app
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Vite requires environment variables to be present during the build process
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
# Copy the build output from the first stage to Nginx's folder
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copy your custom nginx config (if you have one)
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
