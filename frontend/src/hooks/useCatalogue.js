import { useEffect, useState } from 'react';
import { fetchCatalogue } from '../lib/catalogue';
import backendurl from '../constants/constants';

export default function useCatalogue(sellerEmail = null, gender = null) {
  const [catalogue, setCatalogue] = useState({ products: [], categories: [] });
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setStatus('loading');
    fetchCatalogue(backendurl, controller.signal, sellerEmail, gender)
      .then(data => { if (active) { setCatalogue(data); setStatus('ready'); } })
      .catch(() => { if (active) setStatus('error'); })
      .finally(() => clearTimeout(timeout));
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [attempt, sellerEmail, gender]);
  return { ...catalogue, status, retry: () => setAttempt(value => value + 1) };
}
