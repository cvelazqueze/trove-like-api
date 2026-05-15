import { AppError } from '../errors/AppError';
import { cacheDelByPrefix, cacheGetOrSet, cacheKeys } from '../lib/cache';
import { config } from '../config';
import { productRepository } from '../repositories/product.repository';
import { serializeProduct, serializeProducts } from '../utils/serialize';
import type { PriceChangeNotifier } from '../socket/types';

let priceChangeNotifier: PriceChangeNotifier | null = null;

export function setPriceChangeNotifier(notifier: PriceChangeNotifier) {
  priceChangeNotifier = notifier;
}

export const productService = {
  async create(data: { name: string; description?: string; price: number; imageUrl?: string }) {
    const product = await productRepository.create(data);
    await cacheDelByPrefix(cacheKeys.trendingProducts);
    return serializeProduct(product);
  },

  async list() {
    const products = await productRepository.findAll();
    return serializeProducts(products);
  },

  async getTrending(limit: number) {
    const products = await cacheGetOrSet(
      `${cacheKeys.trendingProducts}:${limit}`,
      config.cache.trendingTtlSeconds,
      () => productRepository.findTrending(limit),
    );
    return serializeProducts(products);
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw AppError.notFound('Product not found');
    return serializeProduct(product);
  },

  async update(
    id: string,
    data: { name?: string; description?: string | null; price?: number; imageUrl?: string | null },
  ) {
    const existing = await productRepository.findById(id);
    if (!existing) throw AppError.notFound('Product not found');

    const priceChanged = data.price !== undefined && Number(existing.price) !== data.price;

    const product = await productRepository.update(id, data);
    if (!product) throw AppError.notFound('Product not found');

    await cacheDelByPrefix(cacheKeys.trendingProducts);

    if (priceChanged && priceChangeNotifier) {
      const links = await productRepository.findCollectionIdsByProductId(id);
      await priceChangeNotifier({
        productId: id,
        name: product.name,
        previousPrice: Number(existing.price),
        newPrice: Number(product.price),
        collectionIds: links.map((l) => l.collectionId),
      });
    }

    return serializeProduct(product);
  },

  async delete(id: string) {
    await this.getById(id);
    await productRepository.delete(id);
    await cacheDelByPrefix(cacheKeys.trendingProducts);
  },
};
