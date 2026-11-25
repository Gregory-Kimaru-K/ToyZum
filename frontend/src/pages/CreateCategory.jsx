import { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import CategoryContext from '../Context/CategoryContext';
import PageShell from '../components/ui/PageShell';
import FormField from '../components/ui/FormField';
import { AccessState, Notice } from '../components/ui/Feedback';
import { readImageFiles } from '../lib/forms';
import Icon from '../components/storefront/Icon';

export default function CreateCategory() {
  const { user } = useContext(AuthContext);
  const { createCategory, industries, getIndustries, industryStatus } = useContext(CategoryContext);
  const location = useLocation();
  const [params] = useSearchParams();
  const [form, setForm] = useState(() => ({ name: location.state?.categoryDraft?.name || '', image: location.state?.categoryDraft?.image || null, industry: params.get('departmentId') || location.state?.categoryDraft?.industry || '' }));
  const [pending, setPending] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const allowed = user?.role === 'SUPERUSER';
  useEffect(() => { if (allowed) getIndustries(); }, [allowed, getIndustries]);
  async function imageChanged(event) {
    if (!event.target.files.length) return;
    setReading(true); setError('');
    try { const [image] = await readImageFiles(event.target.files); setForm(previous => ({ ...previous, image })); }
    catch (err) { setError(err.message); }
    finally { setReading(false); }
  }
  async function submit(event) {
    event.preventDefault();
    if (pending || reading) return;
    setPending(true); setError(''); setSaved(false);
    try {
      const result = await createCategory(form);
      if (result.success) { setSaved(true); setForm({ name: '', image: null, industry: '' }); }
      else setError(result.errors);
    } catch { setError('We couldn’t save the category. Please try again.'); }
    finally { setPending(false); }
  }
  const change = event => { setSaved(false); setForm(previous => ({ ...previous, [event.target.name]: event.target.value })); };
  return <PageShell title="A place for every game." eyebrow="STORE MANAGEMENT" description="Create a category to keep the shelves easy to explore.">{!allowed ? <AccessState seller next="/home/category/create_category" /> : <form className="gh-form gh-panel gh-form-narrow" onSubmit={submit} aria-busy={pending || reading}><h2>Create category</h2><Link className="gh-text-link" to="/home/department/create?next=category" state={{ categoryDraft: form }}>Add a department <Icon name="arrow" size={16} /></Link><Notice kind="error">{error}</Notice><Notice kind="success">{saved && 'Category created. You can now use it when adding products.'}</Notice><FormField label="Category name" name="name" required value={form.name} onChange={change} /><FormField label="Department" name="industry"><select id="industry" name="industry" required value={form.industry} onChange={change}><option value="">Choose a department</option>{industries.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>{industryStatus === 'error' && <Notice kind="error">Departments couldn’t be loaded. <button type="button" className="gh-inline-button" onClick={getIndustries}>Try again</button></Notice>}{industryStatus === 'ready' && !industries.length && <Notice>No departments are available yet. Use “Add a department” above to create one, then continue with this category.</Notice>}<FormField label="Category image (optional)" name="category-image" type="file" accept="image/*" onChange={imageChanged} />{form.image && <img className="gh-media-preview" src={form.image} alt="Category preview" />}<button className="gh-button" disabled={pending || reading || !industries.length}>{pending ? 'Creating category…' : 'Create category'}<Icon name="arrow" size={18} /></button></form>}</PageShell>;
}
