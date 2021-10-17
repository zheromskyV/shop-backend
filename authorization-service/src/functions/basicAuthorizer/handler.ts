import 'source-map-support/register';

import { APIGatewayAuthorizerResult, APIGatewayTokenAuthorizerHandler } from 'aws-lambda';

import { middyfy } from '@libs/lambda';

export const generatePolicy = (principalId, Resource, Effect): APIGatewayAuthorizerResult => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect,
          Resource
        },
      ],
    },
  };
};

export const basicAuthorizer: APIGatewayTokenAuthorizerHandler = (event, _ctx, cb) => {
  console.log(`[basicAuthorizer] Event: ${JSON.stringify(event)}`);

  if (event.type !== 'TOKEN') {
    cb('Unauthorized');
  }

  try {
    const { authorizationToken } = event;
    const encodedCreds = authorizationToken.split(' ')[1];
    const [username, password] = Buffer.from(encodedCreds, 'base64')
      .toString('utf-8')
      .split(':');

    const storedUserPassword = process.env[username.toLowerCase()];
    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    cb(null, generatePolicy(encodedCreds, event.methodArn, effect));
  } catch (error) {
    cb(`Unauthorized: ${error.message}`);
  }
};

export const main = middyfy(basicAuthorizer);
