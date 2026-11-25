import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../Context/AuthContext';
import CategoryContext from '../Context/CategoryContext';
import PageShell from '../components/ui/PageShell';
import FormField from '../components/ui/FormField';
import { AccessState, Notice } from '../components/ui/Feedback';
import { readImageFiles } from '../lib/forms';
import Icon from '../components/storefront/Icon';

export default function CreateDepartment() {
  const { user } = useContext(AuthContext);
  const { createIndustry } = useContext(CategoryContext);
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const returnToCategory = params.get('next') === 'category';
  const categoryDraft = location.state?.categoryDraft;
  const [form, setForm] = useState({ name: '', image: null });
  const [pending, setPending] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(null);
  const allowed = user?.role === 'SUPERUSER';

  async function imageChanged(event) {
    if (!event.target.files.length) return;
    setReading(true); setError(''); setSaved(null);
    try { const [image] = await readImageFiles(event.target.files); setForm(previous => ({ ...previous, image })); }
    catch (err) { setError(err.message); }
    finally { setReading(false); }
  }

  async function submit(event) {
    event.preventDefault();
    if (pending || reading || saved) return;
    if (!form.name.trim()) { setError('Enter a department name.'); return; }
    setPending(true); setError('');
    try {
      const result = await createIndustry({ ...form, name: form.name.trim() });
      if (result.success) {
        if (returnToCategory) {
          navigate(`/home/category/create_category?departmentId=${encodeURIComponent(result.data.id)}`, { state: { categoryDraft }, replace: true });
        } else setSaved(result.data);
      } else setError(result.errors);
    } catch { setError('We couldn’t create the department. Please try again.'); }
    finally { setPending(false); }
  }

  const categoryPath = '/home/category/create_category';
  return <PageShell title="Make room for more play." eyebrow="STORE MANAGEMENT" description="Create a department, then organise its games and toys into categories." backTo={returnToCategory ? categoryPath : '/profile'} backLabel={returnToCategory ? 'Create category' : 'My account'}>
    {!allowed ? <AccessState seller next={`/home/department/create${returnToCategory ? '?next=category' : ''}`} /> : <form className="gh-form gh-panel gh-form-narrow" onSubmit={submit} aria-busy={pending || reading}>
      <h2>Add department</h2>
      <Notice kind="error">{error}</Notice>
      <Notice kind="success">{saved && <>Department “{saved.name}” created. <Link to={`${categoryPath}?departmentId=${encodeURIComponent(saved.id)}`}>Add its first category →</Link></>}</Notice>
      <FormField label="Department name" name="department-name" required maxLength={100} value={form.name} onChange={event => { setSaved(null); setError(''); setForm(previous => ({ ...previous, name: event.target.value })); }} placeholder="e.g. Games & toys" hint="Departments contain categories. For example: Games & toys → Board games." />
      <FormField label="Department image (optional)" name="department-image" type="file" accept="image/*" onChange={imageChanged} disabled={pending || reading} />
      {form.image && <img className="gh-media-preview" src={form.image} alt="Department preview" />}
      <div className="gh-form-actions"><Link className="gh-text-link" to={returnToCategory ? categoryPath : '/profile'} state={returnToCategory ? { categoryDraft } : undefined}>Cancel</Link><button className="gh-button" disabled={pending || reading || Boolean(saved)}>{pending ? 'Creating department…' : reading ? 'Reading image…' : 'Add department'}<Icon name="arrow" size={18} /></button></div>
    </form>}
  </PageShell>;
}
