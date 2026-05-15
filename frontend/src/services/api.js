import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Global response interceptor — catches network errors & 5xx silently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error / backend down
      toast.error('Cannot reach the server. Make sure the backend is running.')
    } else if (error.response.status === 500) {
      toast.error('Server error. Please try again.')
    }
    return Promise.reject(error)
  }
)

// ── Feedback ─────────────────────────────────────────────────
export const feedbackApi = {
  getAll:  (params = {}) => api.get('/feedback', { params }),
  getById: (id)          => api.get(`/feedback/${id}`),
  create:  (data)        => api.post('/feedback', data),
  update:  (id, data)    => api.put(`/feedback/${id}`, data),
  delete:  (id)          => api.delete(`/feedback/${id}`),
  search:  (params = {}) => api.get('/feedback/search', { params }),
}

// ── Dashboard ─────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
}

export default api
