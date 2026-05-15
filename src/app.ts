import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { swaggerSpec } from './docs/swagger';
import { config } from './config';
import { sequelize } from './database/sequelize';
import { redis } from './lib/redis';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.get('/health', async (_req, res) => {
    try {
      await sequelize.authenticate();
      const redisOk = redis.isOpen ? (await redis.ping()) === 'PONG' : false;
      if (!redisOk) {
        return res.status(503).json({ status: 'degraded', postgres: 'ok', redis: 'down' });
      }
      res.json({ status: 'ok', postgres: 'ok', redis: 'ok' });
    } catch {
      res.status(503).json({ status: 'error' });
    }
  });

  const apiPath = config.apiPrefix.replace(/\/$/, '') || '/api';
  app.use(`${apiPath}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(apiPath, apiRateLimiter, routes);
  app.use(errorHandler);

  return app;
}
