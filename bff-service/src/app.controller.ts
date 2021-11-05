import { Controller, All, Req, BadGatewayException, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Request } from 'express';
import { Cache } from 'cache-manager';
import { AppService } from './app.service';
import { API_URL, CACHE_TTL } from "./app.constants";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  private readonly productsCacheKey = 'PRODUCTS_CACHE';

  @All('*')
  async root(@Req() { originalUrl, method, body }: Request) {
    const [, recipient] = originalUrl.split('/');
    const shouldUseCache = method === 'GET' && recipient === 'products';
    const cachedProducts = await this.cacheManager.get(this.productsCacheKey);

    if (shouldUseCache && cachedProducts) {
      return cachedProducts;
    }

    const recipientUrl = API_URL[recipient];
    const url = `${recipientUrl}${originalUrl}`;

    if (recipientUrl) {
      const { data } = await this.appService.request(method, url, body);

      if (shouldUseCache && !cachedProducts) {
        await this.cacheManager.set(this.productsCacheKey, data, { ttl: CACHE_TTL });
      }

      return data;
    }

    throw new BadGatewayException('Cannot process request');
  }
}
