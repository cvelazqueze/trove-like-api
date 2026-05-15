import { UniqueConstraintError } from 'sequelize';
import { AppError } from '../errors/AppError';
import { CollectionProduct, Product } from '../models';
import { sequelize } from '../database/sequelize';

export const collectionProductRepository = {
  async addProduct(collectionId: string, productId: string) {
    return sequelize.transaction(async (transaction) => {
      const product = await Product.findByPk(productId, { transaction });
      if (!product) {
        throw AppError.notFound('Product not found');
      }

      const link = await CollectionProduct.create(
        { collectionId, productId },
        { transaction },
      );

      return { link, product };
    });
  },

  async removeProduct(collectionId: string, productId: string) {
    const deleted = await CollectionProduct.destroy({
      where: { collectionId, productId },
    });
    return deleted > 0;
  },

  isDuplicateError(err: unknown): boolean {
    return err instanceof UniqueConstraintError;
  },
};
