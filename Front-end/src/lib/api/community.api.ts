import api from '../axios'

export const communityApi = {
  getPublicPosts: (params?: object) => api.get('/community/public-posts', { params }),
  getPosts: (params?: object) => api.get('/community/posts', { params }),
  createPost: (data: FormData | { caption?: string; image?: string }) =>
    (data instanceof FormData ? api.post('/community/posts', data, { headers: { 'Content-Type': 'multipart/form-data' } }) : api.post('/community/posts', data)),
  deletePost: (id: string) => api.delete(`/community/posts/${id}`),
  likePost: (id: string) => api.post(`/community/posts/${id}/like`),
  getComments: (id: string) => api.get(`/community/posts/${id}/comments`),
  addComment: (id: string, data: { content: string }) =>
    api.post(`/community/posts/${id}/comments`, data),
  deleteComment: (id: string) => api.delete(`/community/comments/${id}`),
}
