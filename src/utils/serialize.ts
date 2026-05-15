export function serializeProduct(product: unknown) {
  const plain = toPlain(product);
  return {
    ...plain,
    price: Number(plain.price),
  };
}

export function serializeProducts(products: unknown[]) {
  return products.map(serializeProduct);
}

function toPlain(value: unknown): Record<string, unknown> {
  if (
    value &&
    typeof value === 'object' &&
    'get' in value &&
    typeof (value as { get: (opts: { plain: true }) => Record<string, unknown> }).get === 'function'
  ) {
    return (value as { get: (opts: { plain: true }) => Record<string, unknown> }).get({ plain: true });
  }
  return { ...(value as Record<string, unknown>) };
}
