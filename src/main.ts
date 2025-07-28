import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RoleService } from './modules/users/services/role.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Turizm Acente API')
    .setDescription('Turizm acentesi yönetim sistemi API dökümantasyonu')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors();

  // Seed default roles
  const roleService = app.get(RoleService);
  await roleService.seedDefaultRoles();

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log('🚀 Application is running on: http://localhost:3000');
  console.log('📚 API Documentation: http://localhost:3000/api');
}
bootstrap();
