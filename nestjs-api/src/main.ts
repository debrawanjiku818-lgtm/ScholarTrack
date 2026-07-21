import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });
  
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 ScholarTrack API running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
}
bootstrap();
