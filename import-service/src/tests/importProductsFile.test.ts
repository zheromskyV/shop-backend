import * as AWSMock from 'aws-sdk-mock';
import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent as Event } from 'aws-lambda';

import { importProductsFile } from '../functions/importProductsFile/handler';

describe('Test importProductsFile', () => {
  it('should return 400 and correct message when name is not passed', async () => {
    const event: Partial<Event> = {
      queryStringParameters: {
        name: '',
      },
    };

    const result = await importProductsFile(event as Event);

    expect(result.statusCode).toBe(400);
    expect(result.body).toEqual(JSON.stringify('Bad request - invalid query parameters'));
  });

  it('should return correct response', async () => {
    const event: Partial<Event> = {
      queryStringParameters: {
        name: 'file.csv',
      },
    };
    const mockSignedUrl = 'url';

    AWSMock.setSDKInstance(AWS);
    AWSMock.mock('S3', 'getSignedUrl', mockSignedUrl);

    const result = await importProductsFile(event as Event);

    expect(result.statusCode).toBe(200);
  })
});