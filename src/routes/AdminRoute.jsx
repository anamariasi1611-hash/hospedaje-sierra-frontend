import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente que protege rutas exclusivas para administradores
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Muestra spinner mientras se verifica autenticación y rol
  if (loading) {
    return (
      <div className="text-center mt-5 py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Verificando permisos...</p>
      </div>
    );
  }

  // Redirige a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirige al dashboard si no es administrador
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Muestra el contenido solo si es admin autenticado
  return children;
}