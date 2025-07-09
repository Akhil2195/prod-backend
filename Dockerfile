# Use lightweight Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy only package files to install dependencies first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the app port
EXPOSE 8000

# Run the application
CMD ["node", "src/index.js"]