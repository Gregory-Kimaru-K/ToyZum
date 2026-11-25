import { Link } from 'react-router-dom';
import { useState } from 'react';
import Icon from './Icon';
import { productCategories } from '../../lib/catalogue';

export const formatPrice = value => new Intl.NumberFormat('en-KE', {
  style: 'currency', currency: 'KES', maximumFractionDigits: 2,
}).format(Number(value));

export default function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const sale = Number(product.discountedPrice) > 0 && Number(product.discountedPrice) < Number(product.price);
  return <Link className="gh-product" to={`/home/${product.slug}`}>
    <div className="gh-product-image">
      {product.images?.[0] && !imageFailed
        ? <img src={product.images[0]} alt={product.name} loading="lazy" onError={() => setImageFailed(true)} />
        : <Icon name="box" size={54} />}
      {product.quantity <= 0 && <span className="gh-product-badge">Out of stock</span>}
      {product.quantity > 0 && sale && <span className="gh-product-badge">On offer</span>}
      <span className="gh-product-arrow"><Icon name="arrow" size={18} /></span>
    </div>
    <p className="gh-product-category">{productCategories(product).map(item => item.name).join(' · ') || 'Games & toys'}</p>
    <h3>{product.name}</h3>
    <p className="gh-product-price">{formatPrice(sale ? product.discountedPrice : product.price)} {sale && <del>{formatPrice(product.price)}</del>}</p>
  </Link>;
}
