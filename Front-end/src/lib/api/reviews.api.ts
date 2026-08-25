import api from '../axios'

export const reviewsApi = {
  getByRestaurant: (restaurantId: string, params?: object) =>
    api.get(`/reviews/restaurant/${restaurantId}`, { params }),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  canReview: (orderId: string) => api.get(`/reviews/can-review/${orderId}`),
  create: (orderId: string, data: { rating: number; comment?: string }) =>
    api.post(`/reviews/${orderId}`, data),
  deleteMyReview: (id: string) => api.delete(`/reviews/${id}`),
  adminDeleteReview: (id: string) => api.delete(`/reviews/admin/${id}`),
}
