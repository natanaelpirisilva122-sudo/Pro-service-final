import { app } from './app.js';
import { checkDatabaseConnection } from './config/database.js';
import { env } from './config/env.js';

async function bootstrap() {
  try {
    await checkDatabaseConnection();

    app.listen(env.PORT, () => {
      console.log(`Pro Service API executando em http://localhost:${env.PORT}`);
      console.log(`Documentação: http://localhost:${env.PORT}/docs`);
      console.log(`Health check: http://localhost:${env.PORT}/health`);
    });
  } catch (error) {
    console.error(
      'Não foi possível iniciar a API. Verifique as configurações do MySQL.',
    );
    console.error(error.message);
    process.exit(1);
  }
}

bootstrap();
