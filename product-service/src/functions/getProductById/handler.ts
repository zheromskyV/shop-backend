import 'source-map-support/register';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { DbService } from '../../db/db.service';
import { Product } from '../../models/product.model';

export const getProductById = async (event: APIGatewayProxyEvent) => {
  console.log('[getProductById] Event: ', event);

  let db: DbService;

  try {
    const { productId } = event.pathParameters;

    if (!productId || !DbService.isIdValid(productId)) {
      return formatJSONResponse<string>('Bad request', 400);
    }

    db = new DbService();

    await db.connect();

    const product: Product = await db.getProductById(productId);

    if (!product) {
      return formatJSONResponse<string>('Product not found', 404);
    }

    return formatJSONResponse<Product>(product, 200);
  } catch (error) {
    console.error('[getProductById] Error: ', error);

    return formatJSONResponse<string>('Internal server error', 500);
  } finally {
    await db?.disconnect();
  }
};

export const main = middyfy(getProductById);
