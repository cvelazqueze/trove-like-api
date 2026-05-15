import '../models';
import { sequelize } from './sequelize';
import { logger } from '../lib/logger';

async function migrate() {
  await sequelize.authenticate();
  await sequelize.sync();
  logger.info('Database schema synced');
}

migrate()
  .then(() => sequelize.close())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
