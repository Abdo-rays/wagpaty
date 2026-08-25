import api from '../axios'

export const uploadApi = {
  image: async (file: File, folder: string = 'general') => {
    const form = new FormData()
    form.append('image', file)
    const res = await api.post(`/upload/image?folder=${encodeURIComponent(folder)}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    // Normalize common response shapes into a single value available at resNormalized.data.data
    const raw = res.data
    const candidate = raw?.data?.url || raw?.data?.path || raw?.path || raw?.url || (typeof raw === 'string' ? raw : undefined)
    // Return an object that keeps compatibility with callers that read `resp.data.data` as string or object
    return { data: { data: candidate ?? raw } }
  },
}
