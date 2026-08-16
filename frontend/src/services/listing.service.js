// Listings: browse/filter, CRUD, favourites, categories, featured/recent.
// Backend: GET/POST/PUT/DELETE /listings (+ /categories, /favorite); filters via query.
import { apiGet, apiPost, apiPut, apiDelete, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

// Build a query string from a params object, skipping empty values.
const query = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') search.append(k, v);
  });
  const s = search.toString();
  return s ? `?${s}` : '';
};

export const getCategories = () =>
  USE_MOCKS ? mock.getCategories() : apiGet('/categories');

export const listListings = (params) =>
  USE_MOCKS ? mock.listListings(params) : apiGet(`/listings${query(params)}`);

export const getFeatured = () =>
  USE_MOCKS ? mock.getFeatured() : apiGet('/listings/featured');

export const getRecent = () =>
  USE_MOCKS ? mock.getRecent() : apiGet('/listings/recent');

export const getListing = (id) =>
  USE_MOCKS ? mock.getListing(id) : apiGet(`/listings/${id}`);

export const createListing = (data) =>
  USE_MOCKS ? mock.createListing(data) : apiPost('/listings', data);

export const updateListing = (id, patch) =>
  USE_MOCKS ? mock.updateListing(id, patch) : apiPut(`/listings/${id}`, patch);

export const deleteListing = (id) =>
  USE_MOCKS ? mock.deleteListing(id) : apiDelete(`/listings/${id}`);

export const toggleFavorite = (id) =>
  USE_MOCKS ? mock.toggleFavorite(id) : apiPost(`/listings/${id}/favorite`);

export const getFavorites = () =>
  USE_MOCKS ? mock.getFavorites() : apiGet('/listings/favorites');
