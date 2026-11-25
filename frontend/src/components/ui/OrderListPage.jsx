import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import OrderContext from '../../Context/OrderContext';
import PageShell from './PageShell';
import { AccessState, EmptyState, Notice } from './Feedback';
import Icon from '../storefront/Icon';
import { formatPrice } from '../storefront/ProductCard';

export function orderStatus(status) {
  return status ? status.toLowerCase().replaceAll('_', ' ').replace(/^./, letter => letter.toUpperCase()) : 'Pending';
}

export default function OrderListPage({ management = false }) {
  const { user } = useContext(AuthContext);
  const { getOrders, getMyOrders, orders, myOrders } = useContext(OrderContext);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const allowed = user && (!management || ['SELLER', 'SUPERUSER'].includes(user.role));
  const getList = management ? getMyOrders : getOrders;
  const items = management ? myOrders : orders;
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    setStatus('loading');
    getList().then(result => { if (active) { setStatus(result.success ? 'ready' : 'error'); setError(result.errors || ''); } });
    return () => { active = false; };
  }, [allowed, getList, attempt]);
  return <PageShell title={management ? 'Customer orders.' : 'Your next good times.'} eyebrow={management ? 'STORE MANAGEMENT' : 'MY ORDERS'} description={management ? 'An overview of orders placed for your products.' : 'See the games and toys you’ve ordered.'}>
    {!allowed ? <AccessState seller={management} next={management ? '/orders' : '/myorders'} /> : status === 'loading' ? <div className="gh-panel gh-loading-message" role="status">Loading your orders…</div> : status === 'error' ? <><Notice kind="error">{error}</Notice><button className="gh-button gh-button-outline" onClick={() => setAttempt(value => value + 1)}>Try again</button></> : !items.length ? <EmptyState title={management ? 'No customer orders yet.' : 'Your first round is still to come.'} to="/home/products"><p>{management ? 'Orders for your products will appear here.' : 'Your orders will appear here once you’ve placed one.'}</p></EmptyState> : <div className="gh-order-list">{items.map(item => <Link className="gh-panel gh-order-card" key={item.id || item.slug} to={`/orders/${item.slug}`}><div className="gh-order-image">{item.product?.images?.[0] ? <img src={item.product.images[0]} alt="" /> : <Icon name="box" size={30} />}</div><div className="gh-order-name"><span className="gh-eyebrow">{management ? 'CUSTOMER ORDER' : 'YOUR ORDER'}</span><h2>{item.product?.name || 'Product unavailable'}</h2><p>Quantity: {item.ordered_quantity}{management && item.client?.phone_number ? ` · ${item.client.phone_number}` : ''}</p></div><div className="gh-order-card-end"><span className="gh-status-badge">{orderStatus(item.status)}</span><strong>{formatPrice(Number(item.product?.price || 0) * Number(item.ordered_quantity || 0))}</strong></div><Icon name="arrow" size={18} /></Link>)}</div>}
  </PageShell>;
}
