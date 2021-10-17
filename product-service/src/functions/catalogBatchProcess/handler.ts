import 'source-map-support/register';

import * as AWS from 'aws-sdk';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { DbService } from '../../db/db.service';

export const catalogBatchProcess = async (event) => {
  let dbService: DbService;

  try {
    const sns = new AWS.SNS({ region: 'eu-west-1' });

    dbService = new DbService();

    await dbService.connect();

    for (const record of event.Records) {
      const { title, description, price, count } = JSON.parse(record.body);

      await dbService.beginTransaction();

      const id: string = await dbService.createProduct(title, description, price, count);

      await dbService.commitTransaction();

      await sns.publish({
        Subject: `Product has been created - ${id}`,
        Message: JSON.stringify({ id, title, description, price, count }),
        TopicArn: process.env.SNS_ARN,
        MessageAttributes: {
          count: {
            DataType: 'Number',
            StringValue: `${count}`
          }
        },
      }).promise();
    }

    return formatJSONResponse<string>('OK', 200);
  } catch (error) {
    await dbService.rollbackTransaction();

    console.error('[catalogBatchProcess] Error:', error);

    return formatJSONResponse<string>('Internal server error', 500);
  } finally {
    await dbService?.disconnect();
  }
};

export const main = middyfy(catalogBatchProcess);
