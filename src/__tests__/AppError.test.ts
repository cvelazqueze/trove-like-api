import { AppError } from '../errors/AppError';

describe('AppError', () => {
  it('creates conflict with status 409', () => {
    const err = AppError.conflict('duplicate');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('duplicate');
  });
});
