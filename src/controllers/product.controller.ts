import type { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { param } from '../utils/request';

export const productController = {
  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);
    res.status(201).json({ data: product });
  },

  async list(_req: Request, res: Response) {
    const products = await productService.list();
    res.json({ data: products });
  },

  async trending(req: Request, res: Response) {
    const { limit } = req.query as unknown as { limit: number };
    const products = await productService.getTrending(limit);
    res.json({ data: products });
  },

  async getById(req: Request, res: Response) {
    const product = await productService.getById(param(req, 'id'));
    res.json({ data: product });
  },

  async update(req: Request, res: Response) {
    const product = await productService.update(param(req, 'id'), req.body);
    res.json({ data: product });
  },

  async delete(req: Request, res: Response) {
    await productService.delete(param(req, 'id'));
    res.status(204).send();
  },
};
