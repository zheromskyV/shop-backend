import { Client } from 'pg';

import { Product } from '../models/product.model';

const { PG_HOST, PG_PORT, PG_DATABASE, PG_USERNAME, PG_PASSWORD } = process.env;

export class DbService {
  private static readonly dpOptions = {
    user: PG_USERNAME,
    host: PG_HOST,
    database: PG_DATABASE,
    password: PG_PASSWORD,
    port: PG_PORT,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 5000,
  };
  private static readonly uuidRegex = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/i;

  private client: Client;

  constructor() {
    this.client = new Client(DbService.dpOptions);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async beginTransaction(): Promise<void> {
    await this.client.query('BEGIN');
  }

  async commitTransaction(): Promise<void> {
    await this.client.query('COMMIT');
  }

  async rollbackTransaction(): Promise<void> {
    await this.client.query('ROLLBACK');
  }

  async getProductList(): Promise<Product[]> {
    const { rows } = await this.client.query(
      'select p.*, s.count from products p left join stocks s on p.id = s.product_id'
    );

    return rows;
  }

  async getProductById(productId: string): Promise<Product> {
    const { rows } = await this.client.query(
      'select p.*, s.count from products p left join stocks s on p.id = s.product_id where p.id=$1',
      [productId]
    );

    return rows[0];
  }

  async createProduct(title: string, description: string, price: number, count: number): Promise<string> {
    const { rows } = await this.client.query(
      'insert into products(title, description, price) values ($1, $2, $3) returning id',
      [title, description, price]
    );

    const { id } = rows[0];

    await this.client.query(
      'insert into stocks(product_id, count) values ($1, $2)',
      [id, count]
    );

    return id;
  }

  static isIdValid(id: string): boolean {
    return DbService.uuidRegex.test(id);
  }
}