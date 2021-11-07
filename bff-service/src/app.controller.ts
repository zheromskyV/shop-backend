import { Controller, All, Req, BadGatewayException, Inject, CACHE_MANAGER } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { Request } from 'express';
import { Cache } from 'cache-manager';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  private readonly productsCacheKey = 'PRODUCTS_CACHE';

  @All('*')
  async root(@Req() { originalUrl, method, body }: Request) {
    const recipient = originalUrl.split('/')[1];
    const shouldUseCache = method === 'GET' && recipient === 'products';
    const cachedProducts = await this.cacheManager.get(this.productsCacheKey);

    if (shouldUseCache && cachedProducts) {
      return cachedProducts;
    }

    const recipientUrl = this.configService.get<string>(recipient);
    const url = `${recipientUrl}${originalUrl}`;

    if (recipientUrl) {
      const { data } = await this.appService.request(method, url, body);

      if (shouldUseCache && !cachedProducts) {
        await this.cacheManager.set(this.productsCacheKey, data);
      }

      return data;
    }

    throw new BadGatewayException('Cannot process request');
  }
}
