# Use the official Node.js 20 Alpine base image (lightweight)
FROM node:24-alpine

# Set the working directory
WORKDIR /usr/src/app

# --- Security: Upgrade Alpine packages to latest patched versions ---
# apk update - refreshes package index
# apk upgrade - upgrades all installed packages (patches known vulnerabilities)
# rm -rf /var/cache/apk/* - cleans up cache to keep image small
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Start the application
CMD ["node", "./public/scripts/index.js"]
