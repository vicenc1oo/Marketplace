// Dashboard stats. Backend: GET /analytics/dashboard -> counts for the overview cards.
import { apiGet, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export const getDashboardStats = () =>
  USE_MOCKS ? mock.getDashboardStats() : apiGet('/analytics/dashboard');
