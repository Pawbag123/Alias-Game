import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
<<<<<<< HEAD
import { ValidationPipe } from '@nestjs/common';
=======
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
>>>>>>> a7928665cfc8d0d161a001d00616620c9eb02e38

dotenv.config();

async function bootstrap() {
<<<<<<< HEAD
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
=======
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //Setting handlebars view engine
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'src', 'views'));
  app.useStaticAssets(join(__dirname, '..', 'src', 'public'));

>>>>>>> a7928665cfc8d0d161a001d00616620c9eb02e38
  await app.listen(3000);
}
bootstrap();
