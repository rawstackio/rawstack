import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: true,
    }),
  });

  // enable trust proxy if behind a reverse proxy (e.g., Nginx, AWS ALB)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.enableCors();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();
