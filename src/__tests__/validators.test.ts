import { registerSchema } from '../validators/auth.schema';
import { createProductSchema } from '../validators/product.schema';

describe('validators', () => {
  it('rejects invalid register payload', () => {
    const result = registerSchema.safeParse({ email: 'bad', password: 'short', name: '' });
    expect(result.success).toBe(false);
  });

  it('accepts valid product payload', () => {
    const result = createProductSchema.safeParse({
      name: 'Headphones',
      price: 99.99,
    });
    expect(result.success).toBe(true);
  });
});
