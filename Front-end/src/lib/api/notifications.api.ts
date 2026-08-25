import api from '../axios'

export const notificationsApi = {
  getAll: (params?: { unreadOnly?: boolean }) => api.get('/notifications', { params }),
  readAll: () => api.patch('/notifications/read-all'),
  readOne: (id: string) => api.patch(`/notifications/${id}/read`),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}
