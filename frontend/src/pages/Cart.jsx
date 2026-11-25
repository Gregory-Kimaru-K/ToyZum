import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import QuantityControl from '../components/ui/QuantityControl';
import { EmptyState, Notice } from '../components/ui/Feedback';
import Icon from '../components/storefront/Icon';
import { formatPrice } from '../components/storefront/ProductCard';
import { productPrice } from '../lib/catalogue';
import { cartQuantity, readCart } from '../lib/cart';

export default function Cart() {
  const [cart, setCart] = useState(() => readCart(localStorage).map(item => ({ ...item, cartQuantity: cartQuantity(item.cartQuantity, item.quantity) })));
  const [error, setError] = useState('');
  function save(next) {
    try { localStorage.setItem('cart', JSON.stringify(next)); setCart(next); setError(''); }
    catch { setError('Your bag couldn’t be saved on this device. Please try again.'); }
  }
  const total = cart.reduce((sum, item) => sum + productPrice(item) * item.cartQuantity, 0);
  return <PageShell title="Your bag of good times." description={cart.length ? `${cart.length} ${cart.length === 1 ? 'favourite' : 'favourites'}, ready for another round.` : 'A little space for your next favourite.'} action={<Link className="gh-text-link" to="/home/products">Keep exploring <Icon name="arrow" size={17} /></Link>}><Notice kind="error">{error}</Notice>{!cart.length ? <EmptyState title="The fun starts with a first pick." icon="bag" to="/home/products"><p>Your bag is empty. Let’s find something worth putting the phone down for.</p></EmptyState> : <div className="gh-bag-grid"><div className="gh-bag-items">{cart.map(item => <article className="gh-bag-item gh-panel" key={item.id}><Link className="gh-bag-image" to={`/home/${item.slug}`}>{item.images?.[0] ? <img src={item.images[0]} alt={item.name} /> : <Icon name="box" size={32} />}</Link><div className="gh-bag-item-details"><Link to={`/home/${item.slug}`}><h2>{item.name}</h2></Link><p>{formatPrice(productPrice(item))} each</p>{item.quantity <= 0 ? <span className="gh-stock-empty">Currently out of stock</span> : <QuantityControl value={item.cartQuantity} max={Number(item.quantity)} onChange={value => save(cart.map(product => product.id === item.id ? { ...product, cartQuantity: cartQuantity(value, product.quantity) } : product))} label={`Quantity for ${item.name}`} />}</div><div className="gh-bag-item-end"><strong>{formatPrice(productPrice(item) * item.cartQuantity)}</strong><button className="gh-text-link" onClick={() => save(cart.filter(product => product.id !== item.id))} aria-label={`Remove ${item.name} from bag`}>Remove <Icon name="close" size={14} /></button></div></article>)}</div><aside className="gh-panel gh-bag-summary"><p className="gh-eyebrow">YOUR NEXT GOOD TIME</p><h2>Bag summary</h2><div><span>Items subtotal</span><strong>{formatPrice(total)}</strong></div><p>Prices and stock will be confirmed when ordering opens. Delivery charges are not included.</p><Notice>Online checkout isn’t available yet. Your picks stay saved in this browser.</Notice><Link className="gh-button" to="/home/products">Find more favourites <Icon name="arrow" size={18} /></Link></aside></div>}</PageShell>;
}
