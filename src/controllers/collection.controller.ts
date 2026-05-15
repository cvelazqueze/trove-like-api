import type { Request, Response } from 'express';
import { collectionService } from '../services/collection.service';
import { param } from '../utils/request';

export const collectionController = {
  async create(req: Request, res: Response) {
    const collection = await collectionService.create(req.user!.sub, req.body.name);
    res.status(201).json({ data: collection });
  },

  async list(req: Request, res: Response) {
    const collections = await collectionService.list(req.user!.sub);
    res.json({ data: collections });
  },

  async getById(req: Request, res: Response) {
    const collection = await collectionService.getById(param(req, 'id'), req.user!.sub);
    res.json({ data: collection });
  },

  async update(req: Request, res: Response) {
    const collection = await collectionService.update(param(req, 'id'), req.user!.sub, req.body.name);
    res.json({ data: collection });
  },

  async delete(req: Request, res: Response) {
    await collectionService.delete(param(req, 'id'), req.user!.sub);
    res.status(204).send();
  },

  async addProduct(req: Request, res: Response) {
    const result = await collectionService.addProduct(
      param(req, 'id'),
      req.user!.sub,
      req.body.productId,
    );
    res.status(201).json({ data: result });
  },

  async removeProduct(req: Request, res: Response) {
    await collectionService.removeProduct(param(req, 'id'), req.user!.sub, param(req, 'productId'));
    res.status(204).send();
  },
};
