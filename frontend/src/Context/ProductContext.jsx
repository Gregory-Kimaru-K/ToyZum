import { createContext, useContext } from 'react';
import AuthContext from './AuthContext';
import { submitJson } from '../lib/api';

const ProductContext = createContext();
export default ProductContext;

export function ProductProvider({ children }) {
  const { authTokens } = useContext(AuthContext);
  const createProduct = formData => submitJson('product/create/', formData, authTokens?.access);
  return <ProductContext.Provider value={{ createProduct }}>{children}</ProductContext.Provider>;
}
