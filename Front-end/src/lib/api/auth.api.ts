import api from '../axios'

export const authApi = {
  customerSignup: (data: {
    name: string
    email: string
    password: string
    confirmPassword: string
    phone: string
  }) => api.post('/auth/customer/signup', data),

  restaurantSignup: (data: {
    ownerName: string
    restaurantName: string
    email: string
    password: string
    confirmPassword: string
    phone: string
    address: string
    category: string
  }) => api.post('/auth/restaurant/signup', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),

  resendOtp: (data: { email: string }) =>
    api.post('/auth/resend-otp', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forget-password', data),

  resetPassword: (data: { email: string; otp: string; password: string; confirmPassword: string }) =>
    api.post('/auth/reset-password', data),
}
