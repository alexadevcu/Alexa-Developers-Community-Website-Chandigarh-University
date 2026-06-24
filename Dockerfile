# Use the official Node.js image for development
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the Vite default port
EXPOSE 5173

# Run the Vite development server on 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host"]
