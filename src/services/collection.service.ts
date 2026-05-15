import { AppError } from '../errors/AppError';
import { Collection, Product } from '../models';
import { collectionRepository } from '../repositories/collection.repository';
import { collectionProductRepository } from '../repositories/collectionProduct.repository';
import { serializeProduct } from '../utils/serialize';

type ProductWithThrough = Product & { CollectionProduct: { addedAt: Date } };

function mapCollection(collection: Collection) {
  const products = (collection.products ?? []) as ProductWithThrough[];

  return {
    id: collection.id,
    name: collection.name,
    userId: collection.userId,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    products: products
      .map((product) => ({
        addedAt: product.CollectionProduct.addedAt,
        ...serializeProduct(product),
      }))
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime()),
  };
}

export const collectionService = {
  async create(userId: string, name: string) {
    const collection = await collectionRepository.create({ name, userId });
    return { ...collection.get({ plain: true }), products: [] };
  },

  async list(userId?: string) {
    const collections = userId
      ? await collectionRepository.findByUserId(userId)
      : await collectionRepository.findAll();
    return collections.map(mapCollection);
  },

  async getById(id: string, userId?: string) {
    const collection = await collectionRepository.findById(id);
    if (!collection) throw AppError.notFound('Collection not found');
    if (userId && collection.userId !== userId) {
      throw AppError.forbidden('You do not own this collection');
    }
    return mapCollection(collection);
  },

  async update(id: string, userId: string, name: string) {
    await this.assertOwner(id, userId);
    await collectionRepository.update(id, { name });
    return this.getById(id);
  },

  async delete(id: string, userId: string) {
    await this.assertOwner(id, userId);
    await collectionRepository.delete(id);
  },

  async addProduct(collectionId: string, userId: string, productId: string) {
    await this.assertOwner(collectionId, userId);

    try {
      const { link, product } = await collectionProductRepository.addProduct(collectionId, productId);
      return {
        collectionId,
        productId,
        addedAt: link.addedAt,
        product: serializeProduct(product),
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (collectionProductRepository.isDuplicateError(err)) {
        throw AppError.conflict('Product already in collection', 'DUPLICATE_PRODUCT');
      }
      throw err;
    }
  },

  async removeProduct(collectionId: string, userId: string, productId: string) {
    await this.assertOwner(collectionId, userId);
    const removed = await collectionProductRepository.removeProduct(collectionId, productId);
    if (!removed) throw AppError.notFound('Product not in collection');
  },

  async assertOwner(collectionId: string, userId: string) {
    const collection = await collectionRepository.findById(collectionId, false);
    if (!collection) throw AppError.notFound('Collection not found');
    if (collection.userId !== userId) {
      throw AppError.forbidden('You do not own this collection');
    }
    return collection;
  },
};
