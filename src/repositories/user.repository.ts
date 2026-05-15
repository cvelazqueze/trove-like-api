import { User } from '../models';

const publicAttributes = ['id', 'email', 'name', 'createdAt', 'updatedAt'] as const;

export const userRepository = {
  create(data: { email: string; passwordHash: string; name: string }) {
    return User.create(data);
  },

  findByEmail(email: string) {
    return User.findOne({ where: { email } });
  },

  findById(id: string) {
    return User.findByPk(id, { attributes: [...publicAttributes] });
  },

  findAll() {
    return User.findAll({
      attributes: [...publicAttributes],
      order: [['createdAt', 'DESC']],
    });
  },

  update(id: string, data: { name?: string; email?: string }) {
    return User.update(data, {
      where: { id },
      returning: true,
    }).then(async () => this.findById(id));
  },

  async delete(id: string) {
    await User.destroy({ where: { id } });
  },
};
