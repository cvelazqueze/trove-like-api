import { CollectionProduct, Product } from '../models';

export interface ProductInput {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string | null;
  price?: number;
  imageUrl?: string | null;
}

export const productRepository = {
  create(data: ProductInput) {
    return Product.create({
      name: data.name,
      description: data.description ?? null,
      price: String(data.price),
      imageUrl: data.imageUrl ?? null,
    });
  },

  findById(id: string) {
    return Product.findByPk(id);
  },

  findAll() {
    return Product.findAll({ order: [['createdAt', 'DESC']] });
  },

  findTrending(limit: number) {
    return Product.findAll({
      limit,
      order: [
        ['price', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
  },

  async update(id: string, data: ProductUpdateInput) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    if (data.name !== undefined) product.name = data.name;
    if (data.description !== undefined) product.description = data.description;
    if (data.price !== undefined) product.price = String(data.price);
    if (data.imageUrl !== undefined) product.imageUrl = data.imageUrl;

    await product.save();
    return product;
  },

  async delete(id: string) {
    await Product.destroy({ where: { id } });
  },

  findCollectionIdsByProductId(productId: string) {
    return CollectionProduct.findAll({
      where: { productId },
      attributes: ['collectionId'],
    });
  },
};
