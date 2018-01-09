FROM node:8.8.1

# Set the working directory
WORKDIR /srv

# Copy the current directory contents into the container's WORKDIR
COPY package*.json /srv/

# Make port 3000 available to the world outside this container
EXPOSE 3000

RUN npm install;
