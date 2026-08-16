// Single HTTP entry point: base URL, auth header, JSON parsing and error shape.
// Every service goes through these helpers instead of calling fetch directly.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'mp_token';

// Normalised error thrown by every failed request.
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, headers = {}, signal } = {}) {
  const token = getToken();
  const isFormData = body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: {
      // Let the browser set the multipart boundary for FormData uploads.
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
  });

  // 204 No Content and empty bodies are valid successes.
  const text = await response.text();
  const data = text ? safeParse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, data);
  }
  return data;
}

function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiGet = (path, options) => request(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options) =>
  request(path, { ...options, method: 'POST', body });
export const apiPut = (path, body, options) =>
  request(path, { ...options, method: 'PUT', body });
export const apiDelete = (path, options) => request(path, { ...options, method: 'DELETE' });

// Serve local mock data unless VITE_USE_MOCKS=false (defaults to ON).
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';
