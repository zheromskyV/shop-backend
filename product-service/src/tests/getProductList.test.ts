import { getProductList } from '../functions/getProductList/handler';
import { products } from '../mocks/products';

describe('getProductList', () => {
  it('should return mock products with status 200', async () => {
    const response = await getProductList();

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(products);
  });
});