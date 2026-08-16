// Image upload. Backend: POST /upload (multipart/form-data, field "file") -> { url, name }.
import { apiPost, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export function uploadImage(file) {
  if (USE_MOCKS) return mock.uploadImage(file);
  const form = new FormData();
  form.append('file', file);
  return apiPost('/upload', form);
}
