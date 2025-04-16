"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const error_filter_1 = require("./common/error.filter");
const success_filter_1 = require("./common/success.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useGlobalFilters(new error_filter_1.ErrorFilter());
    app.useGlobalInterceptors(new success_filter_1.SuccessFilter());
    const config = new swagger_1.DocumentBuilder()
        .setTitle("docky")
        .setDescription("docky api")
        .setVersion("1.0")
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api", app, document);
    await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map