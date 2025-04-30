# Use a Node.js version that is compatible with Next.js (version 18 or above)
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the app's files into the container
COPY . .

# Expose the port on which the app will run
EXPOSE 3000

# Start the app when the container starts
CMD ["npm", "run", "dev"]
