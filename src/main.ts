import { NestFactory } from '@nestjs/core';
import * as hbs from 'hbs';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

import { ValidationPipe } from '@nestjs/common';

import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  //Setting handlebars view engine
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'src', 'public'));

  await app.listen(3000);
}
bootstrap();
