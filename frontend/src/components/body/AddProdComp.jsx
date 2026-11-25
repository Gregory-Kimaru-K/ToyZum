import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import CategoryContext from '../../Context/CategoryContext';
import ProductContext from '../../Context/ProductContext';
import PageShell from '../ui/PageShell';
import FormField from '../ui/FormField';
import { AccessState, Notice } from '../ui/Feedback';
import Icon from '../storefront/Icon';
import { readImageFiles, validateProduct } from '../../lib/forms';

const initialForm = { name: '', description: '', price: '', discounted_price: '', quantity: '', categories: [], gender: 'UNISEX', images: [] };

export default function AddProdComp() {
  const { user } = useContext(AuthContext);
  const { getCategories, categories, industries, getIndustries, categoryStatus, industryStatus } = useContext(CategoryContext);
  const { createProduct } = useContext(ProductContext);
  const [form, setForm] = useState(initialForm);
  const [industry, setIndustry] = useState('');
  const [pending, setPending] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const allowed = ['SELLER', 'SUPERUSER'].includes(user?.role);
  useEffect(() => { if (allowed) { getCategories(); getIndustries(); } }, [allowed, getCategories, getIndustries]);
  const change = event => { setSaved(false); setError(''); setForm(previous => ({ ...previous, [event.target.name]: event.target.value })); };
  async function imagesChanged(event) {
    const files = event.target.files;
    if (!files.length) return;
    setReading(true); setError(''); setSaved(false);
    try { const images = await readImageFiles(files); setForm(previous => ({ ...previous, images: [...previous.images, ...images] })); }
    catch (err) { setError(err.message); }
    finally { setReading(false); event.target.value = ''; }
  }
  async function submit(event) {
    event.preventDefault();
    if (pending || reading) return;
    const validation = validateProduct(form);
    if (validation) { setError(validation); return; }
    setPending(true); setError(''); setSaved(false);
    try {
      const result = await createProduct({ ...form, discounted_price: form.discounted_price || null, quantity: Number(form.quantity) });
      if (result.success) { setSaved(true); setForm(initialForm); setIndustry(''); }
      else setError(result.errors);
    } catch { setError('We couldn’t save the product. Please try again.'); }
    finally { setPending(false); }
  }
  return <PageShell title="Add a little more play." eyebrow="STORE MANAGEMENT" description="Add a game or toy to the Gamehouse shelves." action={allowed && <Link className="gh-text-link" to={`/home/products?sellerEmail=${encodeURIComponent(user.email)}`}>View my stock <Icon name="arrow" size={18} /></Link>}>
    {!allowed ? <AccessState seller next="/home/product" /> : <form className="gh-form gh-product-form" onSubmit={submit} aria-busy={pending || reading}>
      <div className="gh-panel gh-product-media"><div className="gh-panel-heading"><span className="gh-step-number">01</span><div><h2>Show it off.</h2><p>Clear images help players find their favourite.</p></div></div>
        <label className="gh-upload" htmlFor="product-images"><Icon name="box" size={38} /><strong>{reading ? 'Reading your images…' : 'Choose product images'}</strong><span>The first image will appear in the catalogue.</span><input id="product-images" type="file" accept="image/*" multiple onChange={imagesChanged} disabled={reading || pending} /></label>
        {form.images.length > 0 && <div className="gh-upload-previews">{form.images.map((image, index) => <div key={index}><img src={image} alt={`Product preview ${index + 1}`} /><button type="button" aria-label={`Remove image ${index + 1}`} onClick={() => setForm(previous => ({ ...previous, images: previous.images.filter((_, i) => i !== index) }))}><Icon name="close" size={15} /></button>{index === 0 && <span>Cover</span>}</div>)}</div>}
        <p className="gh-field-hint">Use the description to include age suitability, player count and play time where relevant.</p>
      </div>
      <div className="gh-panel"><div className="gh-panel-heading"><span className="gh-step-number">02</span><div><h2>The details.</h2><p>Tell us what makes this one worth playing.</p></div></div><Notice kind="error">{error}</Notice><Notice kind="success">{saved && 'Product added to the shelves. You can add another below.'}</Notice>
        <FormField label="Product name" name="name" maxLength={50} required value={form.name} onChange={change} placeholder="e.g. Family board game" />
        <FormField label="Description" name="description"><textarea id="description" name="description" rows={5} required value={form.description} onChange={change} placeholder="What’s in the box, how to play, and who it’s for…" /></FormField>
        <div className="gh-form-row"><FormField label="Price (KES)" name="price" type="number" min="0.01" step="0.01" required value={form.price} onChange={change} /><FormField label="Sale price (optional)" name="discounted_price" type="number" min="0.01" step="0.01" value={form.discounted_price} onChange={change} hint="Leave blank for the regular price." /></div>
        <div className="gh-form-row"><FormField label="Stock quantity" name="quantity" type="number" min="0" step="1" required value={form.quantity} onChange={change} /><FormField label="Audience" name="gender"><select id="gender" name="gender" value={form.gender} onChange={change}><option value="UNISEX">Everyone</option><option value="BOY">Boys</option><option value="GIRL">Girls</option></select></FormField></div>
        <FormField label="Product department" name="industry"><select id="industry" value={industry} onChange={event => setIndustry(event.target.value)}><option value="">All departments</option>{industries.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
        <fieldset className="gh-category-picker"><legend>Categories</legend><p className="gh-field-hint">Choose one or more. Changing the department filter keeps your selections.</p><div>{categories.filter(item => !industry || String(item.industry?.id) === industry).map(item => <label key={item.id}><input type="checkbox" checked={form.categories.includes(String(item.id))} onChange={event => { setError(''); setSaved(false); setForm(previous => ({ ...previous, categories: event.target.checked ? [...previous.categories, String(item.id)] : previous.categories.filter(id => id !== String(item.id)) })); }} /><span>{item.name}</span></label>)}</div>{form.categories.length > 0 && <p className="gh-field-hint">Selected: {categories.filter(item => form.categories.includes(String(item.id))).map(item => item.name).join(', ')}</p>}</fieldset>
        {(categoryStatus === 'error' || industryStatus === 'error') && <Notice kind="error">Categories couldn’t be loaded. <button type="button" className="gh-inline-button" onClick={() => { getCategories(); getIndustries(); }}>Try again</button></Notice>}
        {categoryStatus === 'ready' && !categories.length && <Notice>Add a category before creating a product. {user.role === 'SUPERUSER' && <Link to="/home/category/create_category">Create category</Link>}</Notice>}
        <div className="gh-form-actions"><Link className="gh-text-link" to="/home/products">Cancel</Link><button className="gh-button" disabled={pending || reading || !categories.length} type="submit">{pending ? 'Adding product…' : 'Add product'}<Icon name="arrow" size={18} /></button></div>
      </div>
    </form>}
  </PageShell>;
}
