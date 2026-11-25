import { useContext, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import PageShell from '../components/ui/PageShell';
import FormField from '../components/ui/FormField';
import { AccessState, EmptyState, Notice } from '../components/ui/Feedback';
import Icon from '../components/storefront/Icon';
import { requestJson, submitJson } from '../lib/api';
import { receiptRequestId } from '../lib/inventory';

export default function Inventory() {
  const { user, authTokens } = useContext(AuthContext);
  const token = authTokens?.access;
  const allowed = ['SELLER', 'SUPERUSER'].includes(user?.role);
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(params.get('product') || '');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [listStatus, setListStatus] = useState('loading');
  const [detailStatus, setDetailStatus] = useState('idle');
  const [attempt, setAttempt] = useState(0);
  const [detailAttempt, setDetailAttempt] = useState(0);
  const [quantity, setQuantity] = useState('');
  const [reference, setReference] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [receiptKey, setReceiptKey] = useState(null);

  useEffect(() => {
    if (!allowed || !token) return;
    const controller = new AbortController();
    let active = true;
    setListStatus('loading'); setError('');
    requestJson('inventory/', { token, signal: controller.signal })
      .then(data => { if (active) { setProducts(data); setListStatus('ready'); } })
      .catch(error => { if (active) { setError(error.message); setListStatus('error'); } });
    return () => { active = false; controller.abort(); };
  }, [allowed, token, attempt]);

  useEffect(() => {
    if (!selected || !allowed || !token) { setDetail(null); setDetailStatus('idle'); return; }
    const controller = new AbortController();
    let active = true;
    setDetailStatus('loading'); setError(''); setMessage(''); setQuantity(''); setReference(''); setReceiptKey(null);
    requestJson(`inventory/${encodeURIComponent(selected)}/`, { token, signal: controller.signal })
      .then(data => { if (active) { setDetail(data); setDetailStatus('ready'); } })
      .catch(error => { if (active) { setError(error.message); setDetailStatus('error'); } });
    return () => { active = false; controller.abort(); };
  }, [selected, allowed, token, detailAttempt]);

  async function receive(event) {
    event.preventDefault();
    if (pending || detailStatus !== 'ready') return;
    const units = Number(quantity);
    if (!Number.isInteger(units) || units <= 0) { setError('Enter a whole number of received units greater than zero.'); return; }
    setPending(true); setError(''); setMessage('');
    // Retain this key after a network failure, so retrying cannot add the same receipt twice.
    let key;
    try { key = receiptKey || receiptRequestId(); }
    catch (error) { setError(error.message); setPending(false); return; }
    setReceiptKey(key);
    const result = await submitJson(`inventory/${encodeURIComponent(selected)}/receive/`, { quantity: units, reference: reference.trim(), request_id: key }, token);
    if (result.success && result.data?.product && result.data?.movement) {
      const next = result.data;
      setDetail(previous => ({ product: next.product, movements: [next.movement, ...previous.movements.filter(item => item.id !== next.movement.id)].slice(0, 50) }));
      setProducts(previous => previous.map(item => item.slug === selected ? next.product : item));
      setMessage(`${units} units received. ${next.product.name} now has ${next.product.quantity} units in stock.`);
      setQuantity(''); setReference(''); setReceiptKey(null);
    } else setError(result.errors || 'We couldn’t confirm the receipt. Please retry without changing its details.');
    setPending(false);
  }

  const visibleProducts = products.filter(item => item.name.toLowerCase().includes(search.trim().toLowerCase()) || item.slug?.includes(search.trim().toLowerCase()));
  return <PageShell title="Keep the shelves ready." eyebrow="INVENTORY" description="Receive new stock without replacing the existing quantity." action={<Link className="gh-text-link" to="/home/product">Add a new product <Icon name="arrow" size={18} /></Link>}>
    {!allowed ? <AccessState seller next="/inventory" /> : <>
      <Notice kind="error">{error}</Notice>
      {listStatus === 'loading' ? <div className="gh-panel gh-loading-message" role="status">Loading inventory…</div> : listStatus === 'error' ? <button className="gh-button gh-button-outline" onClick={() => setAttempt(value => value + 1)}>Try again</button> : !products.length ? <EmptyState title="Start with your first product." to="/home/product" label="Add product"><p>Once a product is on the shelves, you can receive new batches here.</p></EmptyState> : <div className="gh-inventory-grid">
        <section className="gh-panel gh-form"><h2>Choose a product</h2><FormField label="Find a product" name="inventory-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name" disabled={pending} /><FormField label="Product" name="inventory-product"><select id="inventory-product" value={selected} disabled={pending} onChange={event => setSelected(event.target.value)}><option value="">Choose a product</option>{visibleProducts.map(item => <option key={item.id} value={item.slug}>{item.name} · {item.quantity} in stock</option>)}</select></FormField>{!visibleProducts.length && <p className="gh-field-hint">No products match this search.</p>}<Notice>New stock adds to the current balance. Receiving stock does not create a new product or change its price.</Notice></section>
        <section>
          {detailStatus === 'loading' && <div className="gh-panel gh-loading-message" role="status">Loading stock history…</div>}
          {detailStatus === 'error' && <button className="gh-button gh-button-outline" onClick={() => setDetailAttempt(value => value + 1)}>Retry stock history</button>}
          {detailStatus === 'idle' && <EmptyState title="Ready for the next batch." icon="box"><p>Choose a product to see its balance and receive stock.</p></EmptyState>}
          {detailStatus === 'ready' && detail && <><form className="gh-form gh-panel" onSubmit={receive} aria-busy={pending}><div className="gh-stock-summary"><div><p className="gh-eyebrow">{detail.product.name}</p><h2>Receive stock</h2></div><div><strong>{detail.product.quantity}</strong><span>currently in stock</span></div></div><Notice kind="success">{message}</Notice><FormField label="Units received" name="received-units" type="number" min="1" step="1" max="2147483647" required value={quantity} disabled={pending} onChange={event => { setQuantity(event.target.value); }} hint="Enter only the new units arriving, not the total stock." /><FormField label="Receipt reference or note (optional)" name="stock-reference" maxLength={200} value={reference} disabled={pending} onChange={event => { setReference(event.target.value); }} placeholder="e.g. Supplier delivery / invoice reference" />{Number(quantity) > 0 && <p className="gh-stock-preview">{detail.product.quantity} + {quantity} received = <strong>{Number(detail.product.quantity) + Number(quantity)} units</strong></p>}<button className="gh-button" type="submit" disabled={pending}>{pending ? 'Recording receipt…' : 'Receive stock'}<Icon name="box" size={20} /></button></form><div className="gh-panel gh-stock-history"><h2>Stock history</h2><p className="gh-field-hint">Latest 50 opening balances and stock receipts.</p>{!detail.movements.length ? <p className="gh-field-hint">No stock movements yet.</p> : <ol>{detail.movements.map(item => <li key={item.id}><div><strong>{item.movement_type === 'OPENING' ? 'Opening stock' : 'Stock received'} · +{item.quantity_change}</strong><span>Balance after: {item.balance_after}</span></div><p>{item.reference || 'No reference'} · {item.recorded_by_name}</p><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString('en-KE')}</time></li>)}</ol>}</div></>}
        </section>
      </div>}
    </>}
  </PageShell>;
}
