# Keycloak-Vault Configuration Utility

## Project Description

This utility, developed in TypeScript, is designed to streamline the process of configuring Keycloak, an open-source Identity and Access Management solution, and setting up Vault, a tool for secrets management. The utility encapsulates the following functionalities:

1. `configureKeycloak()`: This function interacts with Keycloak's REST API to create a new realm. The data used to create this realm is read from a JSON file that must be provided. Additionally, the function uses hardcoded admin credentials to authenticate with Keycloak's API.

2. `createUser()`: The `createUser()` function is responsible for creating a new user within the newly created realm. User details such as username, password, email, and others are specified within the function.

3. `createVaultClient()`: This function creates a new client in the realm. A client is essentially an application that will use Keycloak for authentication. The details for the client are specified within the function.

4. `generateClientSecret()`: This function creates a new secret key for the client. This secret is essential as it allows the client to authenticate with Keycloak.

5. `getAccessToken()`: This function authenticates the admin user and retrieves an access token. This access token is necessary for all subsequent API calls made to Keycloak.

6. `getClientSecret()`: The `getClientSecret()` function retrieves the secret of the client. This secret is used by the client to perform various operations.

7. `authenticateClient()`: This function is used to authenticate your Vault client with Keycloak. It likely uses the client ID and client secret, obtained from the `createVaultClient()` and `getClientSecret()` functions respectively, to authenticate the client with Keycloak. This function demonstrates how a client would authenticate itself to Keycloak, which is essential for the Vault client to access protected resources.

Additionally, the project includes a Bash script `my_script.sh` which is used for setting up and configuring the Vault environment. This script:

- Sets environment variables for Vault's address and token, and other related configurations
- Enables JWT authentication for Vault
- Configures the JWT auth method and default role
- Defines a role named "demo" for the JWT authentication

## How to Run

This utility is designed to be run in a Docker container. The Dockerfile included in the project sets up the environment, installs the necessary dependencies, and runs the utility.

To build and run the Docker container, navigate to the project's root directory and execute the following command in your terminal:

```shell
docker-compose up --build -d
```

The `my_script.sh` script can be run directly in a Unix-based environment with the `bash` command, or can be included in your Dockerfile to be run when the container starts.

Please ensure you have Docker, Docker Compose, and bash (for Unix-based systems) installed and running on your system.

## Contributing


## License


## Contact
