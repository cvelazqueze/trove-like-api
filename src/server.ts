import http from 'http';
import './models';
import { createApp } from './app';
import { config } from './config';
import { sequelize } from './database/sequelize';
import { logger } from './lib/logger';
import { connectRedis, disconnectRedis } from './lib/redis';
import { createSocketServer } from './socket';
import { setPriceChangeNotifier } from './services/product.service';

export async function startServer() {
  await sequelize.authenticate();
  logger.info('PostgreSQL connected');

  await connectRedis();

  const app = createApp();
  const httpServer = http.createServer(app);
  const { notifyPriceChange } = createSocketServer(httpServer);

  setPriceChangeNotifier(notifyPriceChange);

  httpServer.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port}`);
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    httpServer.close();
    await disconnectRedis();
    await sequelize.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
