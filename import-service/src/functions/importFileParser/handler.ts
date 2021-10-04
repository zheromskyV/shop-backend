import 'source-map-support/register';
import { S3Event } from 'aws-lambda/trigger/s3';
import * as AWS from 'aws-sdk';
import csv from 'csv-parser';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

export const importFileParser = async (event: S3Event) => {
  try {
    const { s3: s3FromEvent } = event.Records[0];
    const filePath: string = s3FromEvent.object.key;
    const bucketName: string = s3FromEvent.bucket.name;

    const s3 = new AWS.S3({ region: 'eu-west-1' });
    const sqs = new AWS.SQS({ region: 'eu-west-1' });

    s3.getObject({
        Bucket: bucketName,
        Key: filePath,
      })
      .createReadStream()
      .pipe(csv())
      .on('data', async (data) => {
        await sqs.sendMessage({
          QueueUrl: process.env.SQS_URL,
          MessageBody: JSON.stringify(data),
        }).promise();
      })
      .on('error', (error) => {
        throw error;
      })
      .on('end', async () => {
        await s3.copyObject({
          Bucket: bucketName,
          CopySource: `${bucketName}/${filePath}`,
          Key: filePath.replace('uploaded', 'parsed')
        }).promise();

        await s3.deleteObject({
          Bucket: bucketName,
          Key: filePath,
        }).promise();
      });

    return formatJSONResponse('OK', 202);
  } catch (error) {
    console.error('importFileParser error:', error);

    return formatJSONResponse('Internal server error', 500);
  }
};

export const main = middyfy(importFileParser);
