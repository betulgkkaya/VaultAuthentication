#!/bin/bash

# Set environment variables
export VAULT_ADDR='http://vault:8200'
export VAULT_TOKEN='myroot'

# Print out the values to verify they are set correctly
echo "Vault address: ${VAULT_ADDR}"
echo "Vault token: ${VAULT_TOKEN}"
echo "Realm name: ${REALM_NAME}"
echo "Client name: ${CLIENT_NAME}"
echo "Client secret: ${CLIENT_SECRET}"

# Enable the JWT auth method at the default path ("jwt")
vault auth enable jwt

# Configure the JWT auth method
vault write auth/jwt/config \
    oidc_discovery_url="http://keycloak:8080/auth/realms/${REALM_NAME}" \
    oidc_client_id=${CLIENT_NAME} \
    oidc_client_secret=${CLIENT_SECRET} \
    default_role="demo"
    
# Configure a role named "demo". The set of allowed client IDs
# includes "*" (all clients).
vault write auth/jwt/role/demo \
    role_type="jwt" \
    bound_audiences=${CLIENT_NAME} \
    user_claim="sub" \
    policies="demo"
