import type { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { param } from '../utils/request';

export const userController = {
  async list(_req: Request, res: Response) {
    const users = await userService.list();
    res.json({ data: users });
  },

  async me(req: Request, res: Response) {
    const user = await userService.getById(req.user!.sub);
    res.json({ data: user });
  },

  async getById(req: Request, res: Response) {
    const user = await userService.getById(param(req, 'id'));
    res.json({ data: user });
  },

  async update(req: Request, res: Response) {
    const user = await userService.update(param(req, 'id'), req.body);
    res.json({ data: user });
  },

  async delete(req: Request, res: Response) {
    await userService.delete(param(req, 'id'));
    res.status(204).send();
  },
};
