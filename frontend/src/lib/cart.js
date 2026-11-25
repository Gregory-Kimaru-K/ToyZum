export function readCart(storage) {
  try {
    const cart = JSON.parse(storage.getItem('cart') || '[]');
    return Array.isArray(cart) ? cart.filter(item => item && item.id != null) : [];
  } catch { return []; }
}

export function cartQuantity(value, stock) {
  const max = Math.max(0, Math.trunc(Number(stock) || 0));
  if (!max) return 0;
  return Math.max(1, Math.min(max, Math.trunc(Number(value) || 1)));
}

export function addCartProduct(cart, product, quantity) {
  if (!product || Number(product.quantity) <= 0) return cart;
  const existing = cart.find(item => String(item.id) === String(product.id));
  const entry = { ...product, cartQuantity: cartQuantity(existing ? Number(existing.cartQuantity || 1) + quantity : quantity, product.quantity) };
  return existing ? cart.map(item => String(item.id) === String(product.id) ? entry : item) : [...cart, entry];
}
