import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { ErrorFilter } from "./common/error.filter";
import { SuccessFilter } from "./common/success.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //DTO 유효성 검증
  //TODO: 추후에 예외처리 추가
  app.useGlobalPipes(new ValidationPipe());
  //에러 응답 처리
  app.useGlobalFilters(new ErrorFilter());
  //성공 응답 필터
  app.useGlobalInterceptors(new SuccessFilter());
  const config = new DocumentBuilder()
    .setTitle("docky")
    .setDescription("docky api")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
