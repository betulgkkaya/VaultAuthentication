import axios from 'axios';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import * as qs from 'qs';


import KeycloakAdminClient from 'keycloak-admin';


const KEYCLOAK_URL = 'http://keycloak:8080';
const EXAMPLE_REALM_PATH = './example-realm.json';
const REALM_NAME = 'example-realm';
const CLIENT_NAME = 'vault';
const KEYCLOAK_BASE_URL = 'http://keycloak:8080/auth';

// Define the interface for Axios errors
interface AxiosError extends Error {
  response?: { data: any };
}


async function configureKeycloak() {
  console.log('************************************');
  console.log(' Configure Keycloak realm');
  console.log('************************************');

  const USER = 'admin';
  const PASSWORD = 'admin';
  const GRANT_TYPE = 'password';
  const CLIENT_ID = 'admin-cli';

  const exampleRealmJson = JSON.parse(fs.readFileSync(EXAMPLE_REALM_PATH, 'utf-8'));

  // Get the access_token
  const tokenResponse = await axios.post(
    `${KEYCLOAK_URL}/auth/realms/master/protocol/openid-connect/token`,
    `client_id=${CLIENT_ID}&username=${USER}&password=${PASSWORD}&grant_type=${GRANT_TYPE}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  const access_token = tokenResponse.data.access_token;

  try {
    const response = await axios.post(
     `${KEYCLOAK_URL}/auth/admin/realms`,
      exampleRealmJson,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (response.status === 201) {
      console.log('------------------------------------------------------------------------');
      console.log('The realm is created. ');
      console.log('Open following link in your browser:');
      console.log(`${KEYCLOAK_URL}/admin/master/console/#/example-realm`);
      console.log('------------------------------------------------------------------------');
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    const typedError = error as AxiosError;
    console.log('------------------------------------------------------------------------');
    console.log('Error:');
    console.log('======');
    console.log('');
    console.log('It seems there is a problem with the realm creation:');
    if (typedError.response) {
      console.log('Error details: ', typedError.response.data);
    } else {
      console.log('Error details: ', typedError.message);
    }
    console.log('');
    console.log('The script exits here!');
    console.log('');
    console.log('------------------------------------------------------------------------');
    process.exit(1);
  }
}


 
async function createUser() {
  const USER = 'admin';
  const PASSWORD = 'admin';
  const GRANT_TYPE = 'password';
  const CLIENT_ID = 'admin-cli';

  const newUser = {
    username: 'newuser',
    enabled: true,
    emailVerified: true,
    firstName: 'New',
    lastName: 'User',
    email: 'newuser@example.com',
    credentials: [
      {
        type: 'password',
        value: 'newuserpassword',
        temporary: false,
      },
    ],
  };

  const tokenResponse = await axios.post(
    `${KEYCLOAK_URL}/auth/realms/master/protocol/openid-connect/token`,
    `client_id=${CLIENT_ID}&username=${USER}&password=${PASSWORD}&grant_type=${GRANT_TYPE}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
 

  const access_token = tokenResponse.data.access_token;

  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/auth/admin/realms/${REALM_NAME}/users`,
      newUser,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (response.status === 201) {
      console.log('------------------------------------------------------------------------');
      console.log('The user is created.');
      console.log(`Username: ${newUser.username}`);
      console.log(`Password: ${newUser.credentials[0].value}`);
      console.log('------------------------------------------------------------------------');
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    const typedError = error as AxiosError;
    console.log('------------------------------------------------------------------------');
    console.log('Error:');
    console.log('======');
    console.log('');
    console.log('It seems there is a problem with the user creation:');
    if (typedError.response) {
      console.log('Error details: ', typedError.response.data);
    } else {
      console.log('Error details: ', typedError.message);
    }
    console.log('');
    console.log('The script exits here!');
    console.log('');
    console.log('------------------------------------------------------------------------');
    process.exit(1);
  }
}
async function createVaultClient(accessToken: string): Promise<void> {
  const clientSecret = crypto.randomBytes(64).toString('hex');

  const clientData = {
    clientId: CLIENT_NAME,
    protocol: 'openid-connect',
    'publicClient': false,
    'secret': clientSecret, // generate a new secret for the client
    description: 'This is my client',
    adminUrl: 'http://keycloak:3000',
    redirectUris: [
        'http://app:3000/*',
        'http://vault:8200/ui/vault/auth/oidc/oidc/callback',
        'http://vault:8250/oidc/callback'
      ],
    serviceAccountsEnabled: true,
    standardFlowEnabled: true,
    implicitFlowEnabled: false,
    directAccessGrantsEnabled: true,
    clientAuthenticatorType: 'client-secret',
  };

  try {
    const response = await axios.post(
      `${KEYCLOAK_URL}/auth/admin/realms/${REALM_NAME}/clients`,
      clientData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 201) {
      console.log('------------------------------------------------------------------------');
      console.log(`The ${CLIENT_NAME} client is created.`);
      console.log('------------------------------------------------------------------------');
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    const typedError = error as AxiosError;
    console.log('------------------------------------------------------------------------');
    console.log('Error:');
    console.log('======');
    console.log('');
    console.log('It seems there is a problem with the client creation:');
    if (typedError.response) {
      console.log('Error details: ', typedError.response.data);
    } else {
      console.log('Error details: ', typedError.message);
    }
    console.log('');
    console.log('The script exits here!');
    console.log('');
    console.log('------------------------------------------------------------------------');
    process.exit(1);
  }
}


async function generateClientSecret(accessToken: string, clientId: string): Promise<string> {
  const url = `${KEYCLOAK_BASE_URL}/admin/realms/${REALM_NAME}/clients/${clientId}/client-secret`;

  try {
    const response = await axios.post(url, {}, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    console.log(`Client secret generated for client "${clientId}":`, response.data.value);
    return response.data.value;
  } catch (error) {
    console.error(`Error generating client secret for client "${clientId}":`, error);
    throw error;
  }
}

// Usage: await generateClientSecret(adminAccessToken, vaultClientId);

async function getAccessToken() {
  const USER = 'admin';
  const PASSWORD = 'admin';
  const GRANT_TYPE = 'password';
  const CLIENT_ID = 'admin-cli';

  const tokenResponse = await axios.post(
    `${KEYCLOAK_URL}/auth/realms/master/protocol/openid-connect/token`,
    `client_id=${CLIENT_ID}&username=${USER}&password=${PASSWORD}&grant_type=${GRANT_TYPE}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return tokenResponse.data.access_token;
}


async function getClientSecret(accessToken: string, clientId: string): Promise<string> {
   
    try {
      const secretResponse = await axios.get(
        `${KEYCLOAK_URL}/auth/admin/realms/${REALM_NAME}/clients/${clientId}/client-secret`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (secretResponse.status === 200) {
        const secret = secretResponse.data.value;
        if (secret) {
          console.log('------------------------------------------------------------------------');
          console.log('Client secret:');
          console.log('==============');
          console.log(secret);
          console.log('------------------------------------------------------------------------');
          
          return secret; // Make sure to return the secret.
        } else {
          throw new Error(`Client secret not defined for client: ${clientId}`);
        }
      } else {
        throw new Error(`Unexpected status code: ${secretResponse.status}`);
      }
    } catch(err) {
      console.error(`Error when trying to get client secret: ${err}`);
      throw err;
    }
}



function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function authenticateClient(clientSecret: string) {
  console.log('Starting client authentication...');

  const KEYCLOAK_TOKEN_URL = `${KEYCLOAK_URL}/auth/realms/${REALM_NAME}/protocol/openid-connect/token`;

  const clientId = CLIENT_NAME;
  const grantType = 'client_credentials';

  try {
    const response = await axios.post(
      KEYCLOAK_TOKEN_URL,
      qs.stringify({ grant_type: grantType, client_id: clientId, client_secret: clientSecret }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.status === 200) {
      console.log('Client authenticated successfully');
      const accessToken = response.data.access_token;
      console.log('Access Token:', accessToken);
    } else {
      console.error('Failed to authenticate client');
    }
  } catch (error: any) {
    console.error('An error occurred during client authentication:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request data:', error.request);
    }
  }
}




async function main() {
  await configureKeycloak();
  await sleep(5000);  // sleep/wait for a while
  await createUser();
  await sleep(5000);  // sleep/wait for a while

  const accessToken = await getAccessToken();
  await createVaultClient(accessToken);
  await sleep(5000);  // sleep/wait for a while

  // Get the client ID of the "vault" client
  const clientsResponse = await axios.get(
    `${KEYCLOAK_URL}/auth/admin/realms/${REALM_NAME}/clients`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        clientId: CLIENT_NAME,
      },
    }
  );

  const client = clientsResponse.data.find((c: { clientId: string }) => c.clientId === CLIENT_NAME);
let clientSecretResponse; // Declare the variable outside the if block

if (client) {
  clientSecretResponse = await getClientSecret(accessToken, client.id);
  console.log(`Client secret: "${clientSecretResponse}" .`);
  await authenticateClient(clientSecretResponse);
} else {
  console.error(`Client "${CLIENT_NAME}" not found.`);
  process.exit(1);
}

if (clientSecretResponse) {
  await authenticateClient(clientSecretResponse); // Authenticate the client after all setup is done
} else {
  console.error(`No client secret found to authenticate.`);
  process.exit(1);
}


  await authenticateClient(clientSecretResponse); // Authenticate the client after all setup is done
}

main().catch((err) => console.error('Error during execution:', err));
