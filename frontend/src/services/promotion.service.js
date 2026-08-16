// Listing boosts paid with virtual credits.
// Backend: GET /promotions/packages; POST /promotions { listingId, packageId }.
import { apiGet, apiPost, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export const getPromotionPackages = () =>
  USE_MOCKS ? mock.getPromotionPackages() : apiGet('/promotions/packages');

export const promoteListing = (listingId, packageId) =>
  USE_MOCKS ? mock.promoteListing(listingId, packageId) : apiPost('/promotions', { listingId, packageId });
