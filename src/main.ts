import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import 'reflect-metadata';
// import { ErrorFilter } from './common/error.filter';
// import { SuccessFilter } from './common/success.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //에러 응답 처리
  // app.useGlobalFilters(new ErrorFilter());
  //성공 응답 필터
  // app.useGlobalInterceptors(new SuccessFilter());

  const options = new DocumentBuilder()
    .setTitle('NestJs Practice API')
    .setDescription('NestJs Practice Backend Project API Documentation')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addBearerAuth()
    // .addServer('https://staging.yourapi.com/', 'Staging')
    // .addServer('https://production.yourapi.com/', 'Production')
    // .addTag('Your API Tag')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: 'http://localhost:5173', // 로컬 Vite dev 서버 주소
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
