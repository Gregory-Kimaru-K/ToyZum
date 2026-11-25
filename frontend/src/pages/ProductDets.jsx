import { useContext, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import { requestJson } from '../lib/api';
import { productCategories, productPrice } from '../lib/catalogue';
import { addCartProduct, cartQuantity, readCart } from '../lib/cart';
import { formatPrice } from '../components/storefront/ProductCard';
import PageShell from '../components/ui/PageShell';
import ProductGallery from '../components/ui/ProductGallery';
import QuantityControl from '../components/ui/QuantityControl';
import { EmptyState, Notice } from '../components/ui/Feedback';
import Icon from '../components/storefront/Icon';

export default function ProductDets() {
  const { productid } = useParams();
  const [params] = useSearchParams();
  const { user } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');
  const requestedQuantity = params.get('quantity');
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setStatus('loading'); setAdded(false); setError('');
    requestJson(`product/view/${encodeURIComponent(productid)}`, { signal: controller.signal })
      .then(data => { if (active) { if (!data?.id) throw new Error(); setProduct(data); setQuantity(cartQuantity(requestedQuantity || 1, data.quantity) || 1); setStatus('ready'); } })
      .catch(() => { if (active) setStatus('error'); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; controller.abort(); clearTimeout(timeout); };
  }, [productid, attempt, requestedQuantity]);
  function addToBag() {
    if (!product || product.quantity <= 0) return;
    try { localStorage.setItem('cart', JSON.stringify(addCartProduct(readCart(localStorage), product, quantity))); setAdded(true); setError(''); }
    catch { setError('Your bag couldn’t be saved on this device. Please try again.'); }
  }
  const available = Number(product?.quantity) > 0;
  const sale = product && productPrice(product) < Number(product.price);
  return <PageShell title={status === 'ready' ? product.name : 'Product details'} showHeading={status !== 'ready'} backTo="/home/products" backLabel="Shop">
    {status === 'loading' && <div className="gh-detail-loading" role="status"><div /><div><h2>Finding your next favourite…</h2><p>Loading product details.</p></div></div>}
    {status === 'error' && <EmptyState title="We couldn’t find this one." to="/home/products" label="Back to the shelves" action={<button className="gh-text-link" onClick={() => setAttempt(value => value + 1)}>Try again</button>}><p>The product may be unavailable, or the connection needs another try.</p></EmptyState>}
    {status === 'ready' && <div className="gh-detail-grid"><ProductGallery key={productid} images={product.images || []} name={product.name} /><section className="gh-product-info"><p className="gh-eyebrow">{productCategories(product).map(item => item.name).join(' · ') || 'GAMES, TOYS & GOOD TIMES'}</p><h1>{product.name}</h1><span className={`gh-stock ${available ? '' : 'gh-stock-empty'}`}><span />{available ? 'In stock · Ready for your next round' : 'Currently out of stock'}</span><div className="gh-detail-price"><strong>{formatPrice(productPrice(product))}</strong>{sale && <del>{formatPrice(product.price)}</del>}</div><p className="gh-detail-description">{product.description}</p><div className="gh-detail-buy"><label>Quantity</label><QuantityControl value={quantity} max={Number(product.quantity) || 0} onChange={value => { setQuantity(cartQuantity(value, product.quantity) || 1); setAdded(false); }} /><button className="gh-button" disabled={!available} onClick={addToBag}>{added ? 'Added to your bag' : available ? 'Add to bag' : 'Out of stock'}<Icon name="bag" size={20} /></button></div><Notice kind="error">{error}</Notice>{added && <Notice kind="success">Good choice. It’s in your bag. <Link to="/cart">View bag →</Link></Notice>}<div className="gh-product-notes"><p><Icon name="dice" size={20} /> Good times, waiting to happen.</p><p>Check the product description for age suitability, what’s included and how to play.</p></div>{['SELLER', 'SUPERUSER'].includes(user?.role) && <Link className="gh-text-link" to={`/home/products?sellerEmail=${encodeURIComponent(user.email)}`}>Back to my stock <Icon name="arrow" size={17} /></Link>}<Link className="gh-text-link" to="/home/products">Discover more games & toys <Icon name="arrow" size={17} /></Link></section></div>}
  </PageShell>;
}
