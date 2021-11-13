import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule, ConfigModule.forRoot(), CacheModule.register({ ttl: 120 })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
