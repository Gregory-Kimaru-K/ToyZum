export function safeNextPath(value, fallback = '/home') {
  return value?.startsWith('/') && !value.startsWith('//') && !/[\\\u0000-\u0020]/.test(value) ? value : fallback;
}

export function apiErrorMessage(data, fallback = 'Something went wrong. Please try again.') {
  if (typeof data === 'string') return fallback;
  const messages = Object.values(data || {}).flat().filter(value => typeof value === 'string');
  return messages.length ? messages.join(' ') : fallback;
}

export function readImageFiles(files) {
  return Promise.all(Array.from(files).map(file => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('Please choose image files.')); return; }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('An image could not be read. Please choose it again.'));
    reader.readAsDataURL(file);
  })));
}

export function validateProduct(form) {
  if (!form.name.trim() || !form.description.trim()) return 'Add a product name and description.';
  if (!form.images.length) return 'Choose at least one product image.';
  if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0) return 'Enter a price greater than zero.';
  if (form.discounted_price !== '' && (!Number.isFinite(Number(form.discounted_price)) || Number(form.discounted_price) <= 0 || Number(form.discounted_price) >= Number(form.price))) return 'The sale price must be greater than zero and below the regular price.';
  if (!Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0 || form.quantity === '') return 'Enter a whole stock quantity of zero or more.';
  if (!form.categories?.length && !form.category) return 'Choose at least one product category.';
  return '';
}
