// Notifications (HTTP side; live pushes via socket). List and mark read.
// Backend: GET /notifications; POST /notifications/:id/read, /notifications/read-all.
import { apiGet, apiPost, USE_MOCKS } from './api.js';
import * as mock from './mock/index.js';

export const getNotifications = () =>
  USE_MOCKS ? mock.getNotifications() : apiGet('/notifications');

export const markNotificationRead = (id) =>
  USE_MOCKS ? mock.markNotificationRead(id) : apiPost(`/notifications/${id}/read`);

export const markAllNotificationsRead = () =>
  USE_MOCKS ? mock.markAllNotificationsRead() : apiPost('/notifications/read-all');
