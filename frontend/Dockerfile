FROM node:20-slim
WORKDIR /project/frontend

# 🎯 We keep the install in the Dockerfile so new devs (or a fresh build) 
# don't have to do the manual 'exec' dance we just did.
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

COPY . .
EXPOSE 5173

# 🎯 The "Real" command to start the dashboard
CMD ["npm", "run", "dev", "--", "--host"]
