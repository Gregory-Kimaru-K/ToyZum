import backendurl from '../constants/constants';
import { apiErrorMessage } from './forms';

export async function requestJson(path, { token, ...options } = {}) {
  const response = await fetch(`${backendurl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(apiErrorMessage(data, response.status === 401 ? 'Please sign in again to continue.' : 'We couldn’t complete the request. Please try again.'));
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function submitJson(path, payload, token, method = 'POST') {
  try {
    const data = await requestJson(path, { method, token, body: JSON.stringify(payload) });
    return { success: true, data };
  } catch (error) {
    return { success: false, errors: error instanceof TypeError ? 'We couldn’t connect. Please try again.' : error.message };
  }
}
