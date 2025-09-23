# Use Node.js 18 for better compatibility with modern packages
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]