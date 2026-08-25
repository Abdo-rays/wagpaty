import api from '../axios'

export const reportsApi = {
  create: (data: { targetType: 'restaurant' | 'meal' | 'post'; targetId: string; reason: string }) =>
    api.post('/reports', data),
  getMyReports: () => api.get('/reports/my-reports'),
  getAdminReports: (params?: object) => api.get('/reports/admin', { params }),
  updateReport: (id: string, data: { status: 'reviewed' | 'dismissed' }) =>
    api.patch(`/reports/admin/${id}`, data),
  deleteReport: (id: string) => api.delete(`/reports/admin/${id}`),
}
