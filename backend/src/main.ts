import {
  NestFactory,
} from '@nestjs/core';

import {
  ValidationPipe,
} from '@nestjs/common';

import {
  NestExpressApplication,
} from '@nestjs/platform-express';

import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

  // ==========================================
  // SERVE UPLOADED FILES
  // ==========================================

  app.useStaticAssets(
    join(
      process.cwd(),
      'uploads',
    ),
    {
      prefix: '/uploads/',
    },
  );

  // ==========================================
  // VALIDATION
  // ==========================================

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ==========================================
  // CORS
  // ==========================================

  app.enableCors({
    origin: [
      'http://localhost:3001',
      'https://dev-connect-mocha.vercel.app',
    ],
    credentials: true,
  });

  // ==========================================
  // START SERVER
  // ==========================================

  await app.listen(3000);
}

bootstrap();
