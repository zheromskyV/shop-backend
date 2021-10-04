import * as AWSMock from 'aws-sdk-mock';

import { DbService } from '../db/db.service';
import { Product } from '../models/product.model';
import { catalogBatchProcess } from '../functions/catalogBatchProcess/handler';

jest.mock('../db/db.service');

describe('Test catalogBatchProcess', () => {
  const productId = '1234567890';
  const productToCreate: Omit<Product, 'id'> = {
    title: '123',
    description: '321',
    count: 10,
    price: 10
  };

  let spyCreateProduct: jest.SpyInstance;

  beforeEach(() => {
    (DbService as any).mockClear();
    jest.clearAllMocks();

    spyCreateProduct = jest.spyOn(DbService.prototype, 'createProduct')
  });

  it('should return correct status code', async () => {
    spyCreateProduct.mockResolvedValueOnce(productId);

    const mockEvent = {
      Records: [
        {
          body: JSON.stringify(productToCreate),
        },
      ],
    };

    AWSMock.mock('SNS', 'publish', (_, callback) => {
      callback(undefined, 'success');
    });

    const result = await catalogBatchProcess(mockEvent);

    expect(result.statusCode).toBe(200);
  });

  it('should called create product correct times', async () => {
    spyCreateProduct.mockResolvedValueOnce(productId);

    const mockEvent = {
      Records: [
        {
          body: JSON.stringify(productToCreate),
        },
        {
          body: JSON.stringify(productToCreate),
        },
      ],
    };

    AWSMock.mock('SNS', 'publish', (_, callback) => {
      callback(undefined, 'success');
    });

    await catalogBatchProcess(mockEvent);

    expect(spyCreateProduct).toHaveBeenCalledTimes(2);
  });

  it('should return internal error when database error occurred', async () => {
    spyCreateProduct.mockRejectedValue('error');

    const mockEvent = {
      Records: [
        {
          body: JSON.stringify(productToCreate),
        },
      ],
    };

    AWSMock.mock('SNS', 'publish', (_, callback) => {
      callback(undefined, 'success');
    });

    const result = await catalogBatchProcess(mockEvent);

    expect(result.statusCode).toEqual(500);
  });
});
