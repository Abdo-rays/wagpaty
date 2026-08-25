import api from '../axios'

export const adminApi = {
  getOverview: () => api.get('/admin/overview'),

  // Restaurants
  getRestaurants: (params?: object) => api.get('/admin/restaurants', { params }),
  getRestaurantById: (id: string) => api.get(`/admin/restaurants/${id}`),
  approveRestaurant: (id: string) => api.patch(`/admin/restaurants/${id}/approve`),
  rejectRestaurant: (id: string, data: { reason: string }) => api.patch(`/admin/restaurants/${id}/reject`, data),
  toggleRestaurantStatus: (id: string, data: { isActive: boolean }) => api.patch(`/admin/restaurants/${id}/toggle-status`, data),
  banRestaurant: (id: string, data?: object) => api.patch(`/admin/restaurants/${id}/ban`, data),
  unbanRestaurant: (id: string, data?: object) => api.patch(`/admin/restaurants/${id}/unban`, data),
  deleteRestaurant: (id: string) => api.delete(`/admin/restaurants/${id}`),

  // Customers
  getCustomers: (params?: object) => api.get('/admin/customers', { params }),
  getCustomerById: (id: string) => api.get(`/admin/customers/${id}`),
  toggleCustomerStatus: (id: string, data: { isActive: boolean }) => api.patch(`/admin/customers/${id}/toggle-status`, data),
  banCustomer: (id: string, data: { reason: string }) => api.patch(`/admin/customers/${id}/ban`, data),
  unbanCustomer: (id: string) => api.patch(`/admin/customers/${id}/unban`),
  deleteCustomer: (id: string) => api.delete(`/admin/customers/${id}`),

  // Meals
  getMeals: (params?: object) => api.get('/admin/meals', { params }),
  deleteMeal: (id: string) => api.delete(`/admin/meals/${id}`),

  // Orders
  getOrders: (params?: object) => api.get('/admin/orders', { params }),
  getOrderById: (id: string) => api.get(`/admin/orders/${id}`),
  deleteOrder: (id: string) => api.delete(`/admin/orders/${id}`),
}
