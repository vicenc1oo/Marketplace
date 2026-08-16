// Auth: login, register, current user, password reset.
// Backend: POST /auth/login, /auth/register, /auth/forgot-password; GET /auth/me.
import { apiGet, apiPost, setToken, clearToken, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export async function login(credentials) {
  const res = USE_MOCKS ? await mock.login(credentials) : await apiPost('/auth/login', credentials);
  if (res?.token) setToken(res.token);
  return res;
}

export async function register(data) {
  const res = USE_MOCKS ? await mock.register(data) : await apiPost('/auth/register', data);
  if (res?.token) setToken(res.token);
  return res;
}

export function getCurrentUser() {
  return USE_MOCKS ? mock.me() : apiGet('/auth/me');
}

export function forgotPassword(email) {
  return USE_MOCKS ? mock.forgotPassword(email) : apiPost('/auth/forgot-password', { email });
}

export function logout() {
  clearToken();
}
