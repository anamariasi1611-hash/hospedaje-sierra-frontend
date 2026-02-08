import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Componente que protege rutas que requieren autenticación
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  // Muestra indicador de carga mientras se verifica la autenticación
  if (loading) return <div className="text-center mt-5">Cargando...</div>

  // Redirige a login si no está autenticado, de lo contrario muestra el contenido
  return isAuthenticated ? children : <Navigate to="/login" replace />
}