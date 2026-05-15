import bcrypt from 'bcryptjs';
import { config } from '../config';
import '../models';
import { Collection, CollectionProduct, Product, User } from '../models';
import { sequelize } from './sequelize';

async function main() {
  if (!config.runSeed) {
    console.log('RUN_SEED is not enabled — skipping seed');
    return;
  }

  await sequelize.authenticate();

  const passwordHash = await bcrypt.hash(config.seed.userPassword, config.bcryptRounds);

  const [user] = await User.findOrCreate({
    where: { email: config.seed.userEmail },
    defaults: {
      email: config.seed.userEmail,
      name: config.seed.userName,
      passwordHash,
    },
  });

  const products = await Product.bulkCreate(
    config.seed.products.map((p) => ({
      name: p.name,
      description: p.description ?? null,
      price: String(p.price),
      imageUrl: p.imageUrl ?? null,
    })),
    { ignoreDuplicates: true, returning: true },
  );

  const [collection] = await Collection.findOrCreate({
    where: { userId: user.id, name: config.seed.collectionName },
    defaults: {
      name: config.seed.collectionName,
      userId: user.id,
    },
  });

  for (const product of products.slice(0, Math.min(2, products.length))) {
    await CollectionProduct.findOrCreate({
      where: { collectionId: collection.id, productId: product.id },
      defaults: { collectionId: collection.id, productId: product.id },
    });
  }

  console.log('Seed complete:', {
    user: user.email,
    products: products.length,
    collection: collection.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => sequelize.close());
