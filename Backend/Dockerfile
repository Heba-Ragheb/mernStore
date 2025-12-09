# Use Node.js LTS
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Back4App uses port 8080
ENV PORT=8080
EXPOSE 8080

# Start your correct file
CMD ["node", "index.js"]
