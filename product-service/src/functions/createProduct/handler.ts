import 'source-map-support/register';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { formatJSONResponse, ValidatedEventAPIGatewayProxyEvent } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { DbService } from '../../db/db.service';
import schema from '@functions/createProduct/schema';
import { Product } from '../../models/product.model';

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event: APIGatewayProxyEvent) => {
  console.log('[createProduct] Event: ', event);

  let db: DbService;

  try {
    const { title, description, price, count } = event.body as Partial<Product>;

    if (!title || price < 0 || count < 0) {
      return formatJSONResponse<string>('Bad request', 400);
    }

    db = new DbService();

    await db.connect();

    await db.beginTransaction();

    const id: string = await db.createProduct(title, description, price, count);

    await db.commitTransaction();

    return formatJSONResponse<Product>({
      id, title, description, price, count
    }, 201);
  } catch (error) {
    console.error('[createProduct] Error: ', error);

    await db.rollbackTransaction();

    return formatJSONResponse<string>('Internal server error', 500);
  } finally {
    await db?.disconnect();
  }
};

export const main = middyfy(createProduct);
