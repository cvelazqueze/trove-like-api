import bcrypt from 'bcryptjs';
import { config } from '../config';
import { AppError } from '../errors/AppError';
import { userRepository } from '../repositories/user.repository';
import { signToken } from '../utils/jwt';

export const authService = {
  async register(email: string, password: string, name: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw AppError.conflict('Email already registered', 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = await userRepository.create({ email, passwordHash, name });
    const token = signToken({ sub: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized('Invalid credentials');
    }

    const token = signToken({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token,
    };
  },
};
