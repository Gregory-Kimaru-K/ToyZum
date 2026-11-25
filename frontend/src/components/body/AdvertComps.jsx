import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import PageShell from '../ui/PageShell';
import FormField from '../ui/FormField';
import { AccessState, EmptyState, Notice } from '../ui/Feedback';
import Icon from '../storefront/Icon';
import { submitJson } from '../../lib/api';

export default function AdvertComps({ from = 'CREATE' }) {
  const { user, authTokens } = useContext(AuthContext);
  const [form, setForm] = useState({ image: '', file_type: '', url: '', place: 'MAIN' });
  const [pending, setPending] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const allowed = ['SELLER', 'SUPERUSER'].includes(user?.role);
  function fileChanged(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!/^(image|video)\//.test(file.type)) { setError('Choose an image or video.'); return; }
    setReading(true); setError(''); setSaved(false);
    const reader = new FileReader();
    reader.onload = () => { setForm(previous => ({ ...previous, image: reader.result, file_type: file.type })); setReading(false); };
    reader.onerror = () => { setError('The file couldn’t be read. Please choose it again.'); setReading(false); };
    reader.readAsDataURL(file);
  }
  async function submit(event) {
    event.preventDefault();
    if (pending || reading) return;
    if (!form.image) { setError('Choose an image or video for the advert.'); return; }
    setPending(true); setError(''); setSaved(false);
    const result = await submitJson('advert/new/', form, authTokens?.access);
    if (result.success) setSaved(true);
    else setError(result.errors);
    setPending(false);
  }
  return <PageShell title={from === 'UPDATE' ? 'Update an advert.' : 'Put the fun in the spotlight.'} eyebrow="STORE MANAGEMENT" description="Manage promotional images and videos.">{!allowed ? <AccessState seller next="/adverts" /> : from === 'UPDATE' ? <EmptyState title="Advert editing is coming later." to="/adverts" label="Create a new advert"><p>You can create new adverts now. Editing existing adverts isn’t available in this interface yet.</p></EmptyState> : <form className="gh-form gh-panel gh-form-narrow" onSubmit={submit} aria-busy={pending || reading}><h2>Create advert</h2><Notice kind="error">{error}</Notice><Notice kind="success">{saved && 'Advert saved.'}</Notice><Notice>Adverts are saved for the promotional library. The new homepage currently uses its own fixed hero.</Notice><FormField label="Image or video" name="advert-media" type="file" accept="image/*,video/*" onChange={fileChanged} disabled={reading || pending} />{form.image && (form.file_type.startsWith('video/') ? <video className="gh-media-preview" src={form.image} controls muted playsInline /> : <img className="gh-media-preview" src={form.image} alt="Advert preview" />)}<FormField label="Destination link" name="url" required placeholder="e.g. /home/products" value={form.url} onChange={event => { setSaved(false); setForm(previous => ({ ...previous, url: event.target.value })); }} /><FormField label="Placement" name="place"><select id="place" name="place" value={form.place} onChange={event => { setSaved(false); setForm(previous => ({ ...previous, place: event.target.value })); }}><option value="MAIN">Main</option><option value="SIDE">Side</option></select></FormField><div className="gh-form-actions"><Link className="gh-text-link" to="/profile">Back to account</Link><button className="gh-button" disabled={pending || reading}>{reading ? 'Reading file…' : pending ? 'Saving advert…' : 'Save advert'}<Icon name="arrow" size={18} /></button></div></form>}</PageShell>;
}
