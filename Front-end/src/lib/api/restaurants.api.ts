import api from '../axios'

export const restaurantsApi = {
  // Restaurant dashboard
  getMyProfile: () => api.get('/restaurants/my-profile'),
  updateMyProfile: (data: object) => api.patch('/restaurants/my-profile', data),
  changePassword: (data: { currentPassword: string; password: string; confirmPassword: string }) =>
    api.patch('/restaurants/change-password', data),
  getOverview: () => api.get('/restaurants/overview'),
}
