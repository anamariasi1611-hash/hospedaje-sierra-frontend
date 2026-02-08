import axios from 'axios'

// URL base de la API (usa variable de entorno o fallback a localhost)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Instancia de axios configurada con baseURL y headers por defecto
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de solicitud: agrega automáticamente el token Bearer si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de respuesta: maneja error 401 haciendo logout automático
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
export { API_BASE_URL }