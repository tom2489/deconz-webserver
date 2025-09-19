import { jwtDecode, InvalidTokenError } from 'jwt-decode';
import { useAuthStore } from '@/stores/auth';

export function getTokenExpiration(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch (err) {
    if (err instanceof InvalidTokenError) console.error('JWT token is invalid:', err.message);
    return null;
  }
}

export function scheduleAutoLogout(router) {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) return;

  const exp = getTokenExpiration(token);
  if (!exp) return;

  const now = Date.now();

  if (exp <= now) {
    authStore.logout();
    router.push({ name: 'Login' });
  } else {
    const timeout = exp - now;
    setTimeout(() => {
      authStore.logout();
      router.push({ name: 'Login' });
    }, timeout);
  }
}
