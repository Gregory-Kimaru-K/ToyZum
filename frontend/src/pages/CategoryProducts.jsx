import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import useCatalogue from '../hooks/useCatalogue';
import { filterCatalogue, productPrice } from '../lib/catalogue';
import ProductCard from '../components/storefront/ProductCard';
import CatalogueState from '../components/storefront/CatalogueState';
import Icon from '../components/storefront/Icon';
import FooterComp from '../components/body/FooterComp';

export default function CategoryProducts() {
  const [params, setParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { products, categories, status, retry } = useCatalogue(params.get('sellerEmail'), params.get('gender'));
  const [limit, setLimit] = useState(24);
  const query = params.get('q') || '';
  const category = params.get('categoryId') || '';
  const sort = params.get('sort') || 'recommended';
  const isSeller = user && ['SELLER', 'SUPERUSER'].includes(user.role);
  const selectedCategory = categories.find(item => item.slug === category);
  const activeFilters = ['categoryId', 'industryId', 'price_Gt', 'price_Lt', 'gender'].some(key => params.has(key));

  useEffect(() => { setLimit(24); }, [params]);

  const filtered = useMemo(() => {
    const result = filterCatalogue(products, params);
    if (sort === 'price-low') result.sort((a, b) => productPrice(a) - productPrice(b));
    else if (sort === 'price-high') result.sort((a, b) => productPrice(b) - productPrice(a));
    else if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else result.sort((a, b) => Number(b.featured) - Number(a.featured));
    return result;
  }, [products, params, sort]);

  function update(key, value) {
    setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); return next; });
  }

  function clearFilters() {
    setParams(previous => { const next = new URLSearchParams(previous); ['categoryId', 'industryId', 'price_Gt', 'price_Lt', 'gender'].forEach(key => next.delete(key)); return next; });
  }

  return <div className="gh-storefront gh-catalogue"><div className="gh-container">
    <nav className="gh-breadcrumb" aria-label="Breadcrumb"><Link to="/home">Home</Link><span>/</span><span>Shop</span></nav>
    <div className="gh-catalogue-heading"><div><p className="gh-eyebrow">GOOD TIMES START HERE</p><h1>{params.has('sellerEmail') ? 'Stock catalogue' : query ? `Results for “${query}”` : selectedCategory?.name || 'Find your next favourite.'}</h1><p>Games, toys and little reasons to get together.</p></div>{isSeller && <Link className="gh-button" to="/home/product">Add product <Icon name="box" size={18} /></Link>}</div>
    <div className="gh-category-chips" aria-label="Product categories"><button aria-pressed={!category} onClick={() => update('categoryId', '')}>All games & toys</button>{categories.map(item => <button key={item.id} aria-pressed={category === item.slug} onClick={() => update('categoryId', item.slug)}>{item.name}</button>)}</div>
    <div className="gh-catalogue-toolbar"><span role="status">{status === 'loading' ? 'Finding the fun…' : status === 'ready' ? `${filtered.length} ${filtered.length === 1 ? 'find' : 'finds'}` : 'Catalogue unavailable'}</span><label>Sort by <select value={sort} onChange={event => update('sort', event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A–Z</option></select></label></div>
    <details className="gh-filter-panel"><summary>Filter by budget {activeFilters && <span>• Filters applied</span>}</summary><div><label>Minimum (KES)<input type="number" min="0" step="any" value={params.get('price_Gt') || ''} onChange={event => update('price_Gt', event.target.value)} placeholder="Any" /></label><label>Maximum (KES)<input type="number" min="0" step="any" value={params.get('price_Lt') || ''} onChange={event => update('price_Lt', event.target.value)} placeholder="Any" /></label>{activeFilters && <button className="gh-text-link" onClick={clearFilters}>Clear filters <Icon name="close" size={15} /></button>}</div></details>
    {query && <div className="gh-search-chip">Search: {query}<button onClick={() => update('q', '')} aria-label="Clear search"><Icon name="close" size={16} /></button></div>}
    {status === 'ready' && filtered.length > 0 ? <><div className="gh-product-grid">{filtered.slice(0, limit).map(product => <ProductCard key={product.id} product={product} />)}</div>{filtered.length > limit && <div className="gh-load-more"><button className="gh-button gh-button-outline" onClick={() => setLimit(value => value + 24)}>Show more games & toys <Icon name="arrow" size={18} /></button></div>}</> : <CatalogueState status={status} retry={retry} emptyTitle={products.length ? 'No matches this round.' : undefined} emptyText={products.length ? 'Try a different search, category or budget to find your next favourite.' : undefined} />}
    {status === 'ready' && filtered.length === 0 && (query || activeFilters) && <div className="gh-load-more"><Link className="gh-button gh-button-outline" to="/home/products">Browse all games & toys <Icon name="arrow" size={18} /></Link></div>}
  </div><FooterComp /></div>;
}
