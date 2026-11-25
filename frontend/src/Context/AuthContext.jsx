import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import backendurl from '../constants/constants';
import { readStoredSession, refreshedSession, requestTokens, sessionFromTokens } from '../lib/auth';

const AuthContext = createContext();
export default AuthContext;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return readStoredSession(localStorage); } catch { return null; }
  });
  const currentSession = useRef(session);
  const generation = useRef(0);
  const mounted = useRef(true);
  const refreshInFlight = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const storeSession = useCallback(next => {
    currentSession.current = next;
    setSession(next);
    try {
      if (next) localStorage.setItem('authTokens', JSON.stringify(next.tokens));
      else localStorage.removeItem('authTokens');
    } catch { /* Sign-in can still work for this tab when storage is unavailable. */ }
  }, []);

  const authenticate = useCallback(async (operation, data) => {
    const requestGeneration = ++generation.current;
    try {
      const tokens = await requestTokens(backendurl, operation, data);
      const next = sessionFromTokens(tokens);
      if (!next?.user) throw new Error('Invalid authentication response.');
      if (!mounted.current || requestGeneration !== generation.current) return { success: false, errors: 'This sign-in request is no longer active.' };
      storeSession(next);
      return { success: true };
    } catch (error) {
      return { success: false, errors: error instanceof TypeError ? 'We couldn’t connect. Please try again.' : error.message };
    }
  }, [storeSession]);

  const logoutUser = useCallback(() => {
    generation.current += 1;
    storeSession(null);
    navigate('/home');
  }, [navigate, storeSession]);

  const refreshTokens = useCallback(() => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const previous = currentSession.current;
    if (!previous?.tokens.refresh) { storeSession(null); return Promise.resolve(); }
    const requestGeneration = generation.current;
    const request = requestTokens(backendurl, 'refresh', { refresh: previous.tokens.refresh })
      .then(data => {
        if (mounted.current && generation.current === requestGeneration) storeSession(refreshedSession(previous.tokens, data));
      })
      .catch(error => {
        if (!mounted.current || generation.current !== requestGeneration) return;
        if (error.status === 400 || error.status === 401) storeSession(null);
        else if (previous.user?.exp <= Date.now() / 1000) storeSession({ ...previous, user: null });
      })
      .finally(() => { if (refreshInFlight.current === request) refreshInFlight.current = null; });
    refreshInFlight.current = request;
    return request;
  }, [storeSession]);

  useEffect(() => {
    function checkExpiration() {
      const value = currentSession.current;
      if (!value) return;
      if (!value.user || value.user.exp - Date.now() / 1000 < 10 * 60) refreshTokens();
    }
    checkExpiration();
    const interval = setInterval(checkExpiration, 30000);
    return () => clearInterval(interval);
  }, [session?.tokens.access, refreshTokens]);

  return <AuthContext.Provider value={{
    user: session?.user || null,
    authTokens: session?.tokens || null,
    createUser: data => authenticate('register', data),
    loginUser: data => authenticate('login', data),
    logoutUser,
    refreshTokens,
  }}>{children}</AuthContext.Provider>;
}
