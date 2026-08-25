import api from '../axios'

export const ordersApi = {
  // Customer
  create: async (data: object) => {
    try {
      console.log('[ordersApi.create] payload:', data)
      const res = await api.post('/orders', data)
      console.log('[ordersApi.create] response:', res?.data)
      return res
    } catch (err: any) {
      console.warn('[ordersApi.create] error:', err?.response?.data || err)
      throw err
    }
  },
  getMyOrders: (params?: object) => api.get('/orders/my-orders', { params }),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),

  // Restaurant
  getRestaurantOrders: (params?: object) => api.get('/orders/restaurant-orders', { params }),
  accept: (id: string) => api.patch(`/orders/${id}/accept`),
  reject: (id: string, data?: { reason?: string }) => api.patch(`/orders/${id}/reject`, data),
  onTheWay: (id: string) => api.patch(`/orders/${id}/on-the-way`),
  deliver: (id: string) => api.patch(`/orders/${id}/deliver`),

  // Shared
  getById: (id: string) => api.get(`/orders/${id}`),
}
