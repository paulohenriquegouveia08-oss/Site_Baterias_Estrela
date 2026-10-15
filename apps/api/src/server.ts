import { buildApp } from './app';
import { env } from './config';

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`🚀 Servidor Baterias Estrela rodando em http://${env.HOST}:${env.PORT}`);
    console.log(`📡 Rotas públicas e administrativas versionadas em /api/v1`);
  } catch (err) {
    console.error('❌ Falha ao iniciar servidor:', err);
    process.exit(1);
  }
}

start();
