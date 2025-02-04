import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { SocketIOAdapter } from './socket-io-adapter';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Main (main.ts)');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: ['error', 'warn', 'log'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configService = app.get(ConfigService);

  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'src', 'public'));
  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));

  await app.listen(process.env.PORT || 3000);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
