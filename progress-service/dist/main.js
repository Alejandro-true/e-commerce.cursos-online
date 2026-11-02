"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/load-env");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        instrument: app_module_1.ObserveInstrument,
    });
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Servicio de Progreso de Aprendizaje (Progress Service)')
        .setDescription('API Microservicio para registrar lecciones completadas, calcular porcentaje de avance y marcar clases vistas en la plataforma de Comercio Electrónico de Micro-Aprendizaje.')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Progreso de Aprendizaje')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    common_1.Logger.log(`Servicio de Progreso corriendo en http://localhost:${port}`, 'Bootstrap');
    common_1.Logger.log(`Documentación Swagger en http://localhost:${port}/api/docs`, 'Bootstrap');
}
void bootstrap();
//# sourceMappingURL=main.js.map