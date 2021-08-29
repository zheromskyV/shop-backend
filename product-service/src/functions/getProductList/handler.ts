import 'source-map-support/register';

import { formatJSONResponse } from '@libs/apiGateway';
import { middyfy } from '@libs/lambda';

import { Product } from 'src/models/product.model';
import { products } from '../../mocks/products';

const getProductList = async () => {
  return formatJSONResponse<Product[]>(products, 200);
}

export const main = middyfy(getProductList);
