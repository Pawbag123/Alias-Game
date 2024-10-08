import { NestFactory } from '@nestjs/core';
import * as hbs from 'hbs';
import * as dotenv from 'dotenv';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { SocketIOAdapter } from './socket-io-adapter';
import { AppModule } from './app.module';
import { GameStateService } from './game-state/game-state.service';

dotenv.config();

async function bootstrap() {
  const logger = new Logger('Main (main.ts)');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const gameStateService = app.get(GameStateService);

  //Setting handlebars view engine
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'src', 'public'));
  app.useWebSocketAdapter(
    // new SocketIOAdapter(app, configService, gameStateService),
    new SocketIOAdapter(app, configService),
  );

  await app.listen(3000);

  logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
