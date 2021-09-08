/*
import { APIGatewayProxyEvent as Event } from 'aws-lambda';

import { Product } from '../models/product.model';
import { getProductById } from '../functions/getProductById/handler';
import { products } from '../mocks/products';

describe('getProductList', () => {
  it('should return correct product by id with status 200', async () => {
    const product: Product = { ...products[0] };
    const productId = product.id;
    const event: Partial<Event> = {
      pathParameters: { productId }
    };

    const response = await getProductById(event as Event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(product);
  });

  it('should return status 404 if product is not found', async () => {
    const productId = 'incorrect id';
    const event: Partial<Event> = {
      pathParameters: { productId }
    };

    const response = await getProductById(event as Event);

    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toBe('Product not found');
  });
});
*/
