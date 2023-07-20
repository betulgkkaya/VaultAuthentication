# Use the latest version of node
FROM node:latest

# Create app directory
WORKDIR /app

# Install app dependencies by copying
# package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install jsonwebtoken
RUN npm install jsonwebtoken

# Install TypeScript
RUN npm install -g typescript@5.0.2

# Install Vault CLI
RUN curl -fsSL https://releases.hashicorp.com/vault/1.8.3/vault_1.8.3_linux_amd64.zip -o vault.zip && \
    unzip vault.zip && \
    mv vault /usr/local/bin && \
    rm vault.zip

# Copy the wait-for-it script
COPY wait-for-it.sh ./wait-for-it.sh

# Make the script executable
RUN chmod +x ./wait-for-it.sh

# Bundle app source
COPY . .

# Install typescript definitions
RUN npm install @keycloak/keycloak-admin-client
RUN npm install --save-dev @types/express @types/body-parser @types/jsonwebtoken
RUN npm install --save-dev @types/qs


# Transpile TypeScript to JavaScript
RUN tsc

# Copy the start.sh script
COPY start.sh ./start.sh

# Make the script executable
RUN chmod +x ./start.sh

# Use the wait-for-it script before starting the application and the start.sh script afterwards
CMD ./wait-for-it.sh keycloak:8080 -- /bin/sh start.sh
