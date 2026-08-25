import api from '../axios'

function isForm(d: any): d is FormData {
  return typeof FormData !== 'undefined' && d instanceof FormData
}

export const mealsApi = {
  // Restaurant only
  create: (data: FormData | object) => isForm(data)
    ? api.post('/meals', data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.post('/meals', data),
  getMyMeals: (params?: object) => api.get('/meals/my-meals', { params }),
  getMyMealById: (id: string) => api.get(`/meals/my-meals/${id}`),
  update: (id: string, data: FormData | object) => isForm(data)
    ? api.patch(`/meals/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
    : api.patch(`/meals/${id}`, data),
  delete: (id: string) => api.delete(`/meals/${id}`),

  // Public
  getByRestaurant: (restaurantId: string) => api.get(`/meals/restaurant/${restaurantId}`),
  getById: (id: string) => api.get(`/meals/${id}`),
}
