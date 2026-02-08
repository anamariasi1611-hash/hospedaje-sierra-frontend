import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define el layout protegido que envuelve rutas autenticadas
export default function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  // Muestra spinner mientras se verifica autenticación
  if (loading) {
    return (
      <div className="text-center mt-5 py-5">
        <div className="spinner-border text-orange" role="status" style={{ width: '4rem', height: '4rem' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-4 fs-4">Cargando panel...</p>
      </div>
    );
  }

  // Renderiza rutas hijas si está autenticado, redirige a login si no
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}