import { AppError } from '../errors/AppError';
import { userRepository } from '../repositories/user.repository';

export const userService = {
  list() {
    return userRepository.findAll();
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw AppError.notFound('User not found');
    return user;
  },

  async update(id: string, data: { name?: string; email?: string }) {
    await this.getById(id);
    try {
      return await userRepository.update(id, data);
    } catch {
      throw AppError.conflict('Email already in use', 'EMAIL_EXISTS');
    }
  },

  async delete(id: string) {
    await this.getById(id);
    await userRepository.delete(id);
  },
};
