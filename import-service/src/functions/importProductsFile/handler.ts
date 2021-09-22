import 'source-map-support/register';
import { APIGatewayProxyEvent } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { extname } from 'path';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

export const importProductsFile = async (event: APIGatewayProxyEvent) => {
  try {
    const { name } = event.queryStringParameters;

    if (!name) {
      return formatJSONResponse('Bad request - invalid query parameters', 400);
    }

    const isCsvFormat = extname(name) === '.csv';

    if (!isCsvFormat) {
      return formatJSONResponse('Bad request - invalid file format', 400);
    }

    const s3 = new AWS.S3({ region: 'eu-west-1' });

    const signedUrl: string = s3.getSignedUrl('putObject', {
      Bucket: 'aws-shop-storage',
      Key: `uploaded/${name}`,
      Expires: 60,
      ContentType: 'text/csv'
    });

    return formatJSONResponse(signedUrl, 200);
  } catch (error) {
    console.error('importProductsFile error:', error);

    return formatJSONResponse('Internal server error', 500);
  }
};

export const main = middyfy(importProductsFile);
