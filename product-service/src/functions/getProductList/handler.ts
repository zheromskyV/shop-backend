import 'source-map-support/register';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { DbService } from '../../db/db.service';
import { Product } from '../../models/product.model';

export const getProductList = async (event: APIGatewayProxyEvent) => {
  console.log('[getProductList] Event: ', event);

  let db: DbService;
  try {
    db = new DbService();

    await db.connect();

    const products: Product[] = await db.getProductList();

    return formatJSONResponse<Product[]>(products, 200);
  } catch (error) {
    console.error('[getProductList] Error: ', error);

    return formatJSONResponse<string>('Internal server error', 500);
  } finally {
    await db?.disconnect();
  }
}

export const main = middyfy(getProductList);
