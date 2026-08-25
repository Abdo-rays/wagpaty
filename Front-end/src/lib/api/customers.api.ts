import api from '../axios'

export const customersApi = {
  getMyProfile: () => api.get('/customers/my-profile'),
  updateMyProfile: (data: object) => api.patch('/customers/my-profile', data),
  changePassword: (data: { currentPassword: string; password: string; confirmPassword: string }) =>
    api.patch('/customers/change-password', data),
  getOverview: () => api.get('/customers/overview'),
  getRestaurants: (params?: object) => api.get('/customers/restaurants', { params }),
  getPublicStats: () => api.get('/customers/public-stats'),
  getRestaurantById: (id: string) => api.get(`/customers/restaurants/${id}`),
}
