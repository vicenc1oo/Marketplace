// Bidding (HTTP side; live updates via socket). Auctions, bids, my bids.
// Backend: GET /bidding/auctions, /bidding/:id/bids, /bidding/my-bids; POST a bid.
import { apiGet, apiPost, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export const getActiveAuctions = () =>
  USE_MOCKS ? mock.getActiveAuctions() : apiGet('/bidding/auctions');

export const getBids = (listingId) =>
  USE_MOCKS ? mock.getBids(listingId) : apiGet(`/bidding/${listingId}/bids`);

export const placeBid = (listingId, amount) =>
  USE_MOCKS ? mock.placeBid(listingId, amount) : apiPost(`/bidding/${listingId}/bids`, { amount });

export const getMyBids = () =>
  USE_MOCKS ? mock.getMyBids() : apiGet('/bidding/my-bids');
