import { Collection, Product } from '../models';

const productsInclude = {
  model: Product,
  as: 'products',
  through: { attributes: ['addedAt'] },
};

export const collectionRepository = {
  create(data: { name: string; userId: string }) {
    return Collection.create(data);
  },

  findById(id: string, withProducts = true) {
    return Collection.findByPk(id, {
      include: withProducts ? [productsInclude] : undefined,
    });
  },

  findByUserId(userId: string) {
    return Collection.findAll({
      where: { userId },
      include: [productsInclude],
      order: [['createdAt', 'DESC']],
    });
  },

  findAll() {
    return Collection.findAll({
      include: [productsInclude],
      order: [['createdAt', 'DESC']],
    });
  },

  async update(id: string, data: { name: string }) {
    const collection = await Collection.findByPk(id);
    if (!collection) return null;
    collection.name = data.name;
    await collection.save();
    return collection;
  },

  async delete(id: string) {
    await Collection.destroy({ where: { id } });
  },
};
