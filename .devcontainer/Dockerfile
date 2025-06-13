# Use the official Node.js image as base
FROM mcr.microsoft.com/devcontainers/javascript-node:1-18-bullseye

# Install additional tools
RUN apt-get update && apt-get install -y \
    mysql-server \
    mysql-client \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a directory for MySQL data
RUN mkdir -p /var/lib/mysql /var/run/mysqld \
    && chown -R mysql:mysql /var/lib/mysql /var/run/mysqld

# Expose ports
EXPOSE 8080 5173 3306

# Set working directory
WORKDIR /workspaces/rentspot

# Switch to node user (non-root)
USER node