import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

// Define el layout principal de la aplicación autenticada
export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    // Contenedor principal con altura mínima completa y fondo claro
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', position: 'relative' }}>
      {/* Logo posicionado absolutamente en la esquina superior izquierda */}
      <img 
        src="/logo.png" 
        alt="Logo Hospedaje Sierra" 
        className="absolute-logo" 
        style={{ position: 'absolute', top: 10, left: 35, zIndex: 50 }}
      />

      {/* Header con padding lateral para evitar superposición con el logo */}
      <header className="dashboard-header" style={{ paddingLeft: '120px', paddingRight: '30px' }}>
        <div className="header-text">
          <h4>
            Hospedaje Sierra - Panel
            {/* Muestra nombre completo o username del usuario autenticado */}
            <small>Bienvenido, {user?.nombreCompleto || user?.username || 'admin'}</small>
          </h4>
        </div>

        {/* Botón de logout alineado a la derecha */}
        <button 
          className="btn btn-outline-light btn-logout" 
          onClick={logout}
          style={{ marginLeft: 'auto' }}
        >
          Cerrar sesión
        </button>
      </header>

      {/* Contenido principal en flex para sidebar + main */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar con padding superior para no tapar el logo */}
        <Sidebar style={{ paddingTop: '90px' }} />

        {/* Área principal donde se renderizan las rutas hijas */}
        <main style={{ padding: '2rem', flexGrow: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}