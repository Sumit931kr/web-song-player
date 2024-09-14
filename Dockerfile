# Start with the official Node.js image
FROM node:18

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Update and install necessary packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment and activate it
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Upgrade pip and install spotdl with all dependencies in the virtual environment
RUN pip3 install --upgrade pip \
    && pip3 install spotdl[all]

# Set up working directory
WORKDIR /app

# Copy your code into the container
COPY . /app

# Install Node.js dependencies in the root directory
RUN npm install

# Install Node.js dependencies in the client folder
WORKDIR /app/client
RUN npm install

# Return to the main app directory
WORKDIR /app

# Download FFmpeg using spotdl
RUN python3 -m spotdl --download-ffmpeg

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD ["node", "index.js"]