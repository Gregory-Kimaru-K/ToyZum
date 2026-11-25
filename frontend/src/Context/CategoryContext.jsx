import { createContext, useCallback, useContext, useState } from 'react';
import AuthContext from './AuthContext';
import { requestJson, submitJson } from '../lib/api';

const CategoryContext = createContext();
export default CategoryContext;

export function CategoryProvider({ children }) {
  const { authTokens } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [categoryStatus, setCategoryStatus] = useState('idle');
  const [industryStatus, setIndustryStatus] = useState('idle');
  const getCategories = useCallback(async () => {
    setCategoryStatus('loading');
    try {
      const result = await requestJson('toyzum/graphql/', { method: 'POST', body: JSON.stringify({ query: '{ allCategories { id name slug image industry { id name slug } } }' }) });
      if (result.errors || !result.data?.allCategories) throw new Error();
      setCategories(result.data.allCategories); setCategoryStatus('ready');
    } catch { setCategoryStatus('error'); }
  }, []);
  const getIndustries = useCallback(async () => {
    setIndustryStatus('loading');
    try {
      const result = await requestJson('toyzum/graphql/', { method: 'POST', body: JSON.stringify({ query: '{ allIndustries { id name image slug } }' }) });
      if (result.errors || !result.data?.allIndustries) throw new Error();
      setIndustries(result.data.allIndustries); setIndustryStatus('ready');
    } catch { setIndustryStatus('error'); }
  }, []);
  const createCategory = formData => submitJson('category/new/', formData, authTokens?.access);
  const createIndustry = async formData => {
    const result = await submitJson('industry/new/', formData, authTokens?.access);
    if (result.success) {
      setIndustries(previous => [...previous.filter(item => String(item.id) !== String(result.data.id)), result.data]);
      setIndustryStatus('ready');
    }
    return result;
  };
  return <CategoryContext.Provider value={{ categories, industries, getCategories, getIndustries, categoryStatus, industryStatus, createCategory, createIndustry }}>{children}</CategoryContext.Provider>;
}
