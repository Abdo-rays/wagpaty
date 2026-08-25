import api from '../axios'

export const chatApi = {
  getConversations: () => api.get('/chat'),
  getContacts: () => api.get('/chat/contacts'),
  getUnreadCount: () => api.get('/chat/unread-count'),
  getConversation: (partnerId: string) => api.get(`/chat/${partnerId}`),
  sendMessage: (partnerId: string, data: { content: string }) =>
    api.post(`/chat/${partnerId}`, data),
}
