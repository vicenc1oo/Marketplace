// Virtual-credit wallet. Backend: GET /currency/wallet -> { balance, transactions[] }.
import { apiGet, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export const getWallet = () => (USE_MOCKS ? mock.getWallet() : apiGet('/currency/wallet'));
