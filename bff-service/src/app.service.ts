import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Method, AxiosRequestConfig, AxiosResponse } from 'axios'
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  async request(method: string, url: string, body: unknown): Promise<AxiosResponse> {
    try {
      return lastValueFrom(this.httpService.request(this.getRequestConfig(method, url, body)));
    } catch ({ message, response }) {
      if (response) {
        const { status, data } = response;
        throw new HttpException(data, status);
      }

      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getRequestConfig(method: string, url: string, body: unknown): AxiosRequestConfig {
    return {
      method: method as Method,
      url,
      ...Object.keys(body || {}).length > 0 && {
        data: body
      }
    };
  }
}