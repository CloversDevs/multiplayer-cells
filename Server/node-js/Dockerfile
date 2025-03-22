# Use an official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Install dependencies separately for server and client
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Install client dependencies
WORKDIR /app/client
RUN npm install

# Copy the rest of the application files
WORKDIR /app
COPY . .

# Overwrite the file with the environment variable
# TODO: Get this value from the docker-compose.yml
# RUN echo "export const NAKAMA_SOCKET_SERVER_KEY = '${NAKAMA_SOCKET_SERVER_KEY}';" > ./client/src/publicKeys.ts

# Compile TypeScript for both server and client
RUN cd server && npm run build
RUN cd client && npm run build

# Expose the port the server runs on
EXPOSE 3000

# Start the TypeScript server
CMD ["node", "server/dist/index.js"]
