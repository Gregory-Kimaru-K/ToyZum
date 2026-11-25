import { createContext, useCallback, useContext, useState } from 'react';
import AuthContext from './AuthContext';
import { requestJson, submitJson } from '../lib/api';

const OrderContext = createContext();
export default OrderContext;

export function OrderProvider({ children }) {
  const { authTokens } = useContext(AuthContext);
  const token = authTokens?.access;
  const [orders, setOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const readList = useCallback(async (path, setter) => {
    if (!token) return { success: false, errors: 'Please sign in to see your orders.' };
    try {
      const data = await requestJson(path, { token });
      if (!Array.isArray(data)) throw new Error('Orders couldn’t be loaded. Please try again.');
      setter(data); return { success: true, data };
    } catch (error) {
      // The existing list endpoints return 404 when the account has no orders.
      if (error.status === 404) { setter([]); return { success: true, data: [] }; }
      return { success: false, errors: error.message };
    }
  }, [token]);
  const getOrders = useCallback(() => readList('orders/', setOrders), [readList]);
  const getMyOrders = useCallback(() => readList('my_orders/', setMyOrders), [readList]);
  const getOrder = useCallback(async id => {
    setOrder(null);
    if (!token) return { success: false, errors: 'Please sign in to see your order.' };
    try { const data = await requestJson(`orders/${encodeURIComponent(id)}`, { token }); setOrder(data); return { success: true, data }; }
    catch (error) { return { success: false, errors: error.message }; }
  }, [token]);
  const createOrders = useCallback((data, product) => submitJson(`orders/create/${product}/`, data, token), [token]);
  const updateStatus = useCallback((id, status) => submitJson(`orders/${encodeURIComponent(id)}/`, { status }, token, 'PUT'), [token]);
  return <OrderContext.Provider value={{ orders, myOrders, order, getOrders, getMyOrders, getOrder, createOrders, updateStatus, isReady: Boolean(token) }}>{children}</OrderContext.Provider>;
}
