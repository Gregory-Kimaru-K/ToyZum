import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import OrderContext from '../Context/OrderContext';
import PageShell from '../components/ui/PageShell';
import ProductGallery from '../components/ui/ProductGallery';
import { AccessState, EmptyState, Notice } from '../components/ui/Feedback';
import { orderStatus } from '../components/ui/OrderListPage';
import { formatPrice } from '../components/storefront/ProductCard';

export default function OrderDets() {
  const { orderid } = useParams();
  const { user } = useContext(AuthContext);
  const { getOrder, order } = useContext(OrderContext);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const authenticated = Boolean(user);
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    setStatus('loading');
    getOrder(orderid).then(result => { if (active) setStatus(result.success && result.data?.product ? 'ready' : 'error'); });
    return () => { active = false; };
  }, [authenticated, getOrder, orderid, attempt]);
  return <PageShell title="The details of your good time." eyebrow="ORDER DETAILS" backTo="/myorders" backLabel="My orders">
    {!user ? <AccessState next={`/orders/${orderid}`} /> : status === 'loading' ? <div className="gh-panel gh-loading-message" role="status">Loading order details…</div> : status === 'error' || !order ? <EmptyState title="This order couldn’t be loaded." action={<button className="gh-button gh-button-outline" onClick={() => setAttempt(value => value + 1)}>Try again</button>}><p>Check your connection and make sure you’re signed in with the right account.</p></EmptyState> : <div className="gh-detail-grid"><ProductGallery images={order.product.images || []} name={order.product.name} /><section className="gh-panel gh-order-details"><span className="gh-status-badge">{orderStatus(order.status)}</span><h2>{order.product.name}</h2><p className="gh-detail-description">{order.product.description}</p><dl className="gh-definition-list"><div><dt>Quantity</dt><dd>{order.ordered_quantity}</dd></div><div><dt>Products total</dt><dd>{formatPrice(Number(order.product.price) * Number(order.ordered_quantity))}</dd></div>{order.client?.phone_number && <div><dt>Contact phone</dt><dd>{order.client.phone_number}</dd></div>}{order.communication && <div><dt>Delivery preference</dt><dd>{orderStatus(order.communication)}</dd></div>}{[order.town, order.county, order.country].filter(Boolean).length > 0 && <div><dt>Delivery area</dt><dd>{[order.town, order.county, order.country].filter(Boolean).join(', ')}</dd></div>}</dl><Notice>Order changes and delivery updates aren’t available on this screen yet.</Notice></section></div>}
  </PageShell>;
}
