FROM node:22-alpine

WORKDIR /app

# 1. Install dependencies using your specific fix
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 2. Copy the source code
COPY . .

# 3. Build the production assets
# This will create the /app/dist folder inside the container
RUN npm run build

# No CMD or Nginx here. The container will build and then stop.
CMD ["tail", "-f", "/dev/null"]