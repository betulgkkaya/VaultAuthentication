#!/bin/sh

# Compile TypeScript files
tsc

# Run the scripts
node keycloak_config.js

#Keep the container running
tail -f /dev/null