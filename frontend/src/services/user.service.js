// Users: profile read/update, a user's listings and reviews.
// Backend: GET /users/:id, /users/:id/listings, /users/:id/reviews; PUT /users/me.
import { apiGet, apiPut, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export const getUser = (id) => (USE_MOCKS ? mock.getUser(id) : apiGet(`/users/${id}`));

export const updateProfile = (patch) =>
  USE_MOCKS ? mock.updateProfile(patch) : apiPut('/users/me', patch);

export const getUserListings = (id) =>
  USE_MOCKS ? mock.getUserListings(id) : apiGet(`/users/${id}/listings`);

export const getReviews = (id) =>
  USE_MOCKS ? mock.getReviews(id) : apiGet(`/users/${id}/reviews`);
