FROM node:20

# Install git
RUN apt-get update && apt-get install -y git

# Set working directory
WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 3000

# Start your app
CMD ["npm", "start"]
