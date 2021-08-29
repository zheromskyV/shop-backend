import 'source-map-support/register';
import { APIGatewayProxyEvent } from 'aws-lambda';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { Product } from 'src/models/product.model';
import { products } from '../../mocks/products';

const getProductById = async (event: APIGatewayProxyEvent) => {
  const { productId } = event.pathParameters;

  const product = products.find(({ id }: Product) => productId === id);

  if (!product) {
    return formatJSONResponse<string>('Product not found', 404);
  }

  return formatJSONResponse<Product>(product, 200);
}

export const main = middyfy(getProductById);
