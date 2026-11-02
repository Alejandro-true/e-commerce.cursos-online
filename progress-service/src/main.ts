import './config/load-env';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Servicio de Progreso de Aprendizaje (Progress Service)')
    .setDescription(
      'API Microservicio para registrar lecciones completadas, calcular porcentaje de avance y marcar clases vistas en la plataforma de Comercio Electrónico de Micro-Aprendizaje.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Progreso de Aprendizaje')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(`Servicio de Progreso corriendo en http://localhost:${port}`, 'Bootstrap');
  Logger.log(`Documentación Swagger en http://localhost:${port}/api/docs`, 'Bootstrap');
}
void bootstrap();


