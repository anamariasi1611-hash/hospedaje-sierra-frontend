import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define el componente de navegación lateral (sidebar)
export default function Sidebar() {
  // Usa el contexto de autenticación (solo para forzar re-render si cambia, no usa datos aquí)
  useAuth();

  return (
    // Navegación con enlaces estilizados según estado activo
    <nav className="sidebar">
      {/* Enlace a dashboard principal */}
      <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
        Inicio
      </NavLink>
      
      {/* Enlace a sección de ventas */}
      <NavLink to="/ventas" className={({ isActive }) => isActive ? 'active' : ''}>
        Ventas
      </NavLink>
      
      {/* Enlace a sección de informes */}
      <NavLink to="/informe" className={({ isActive }) => isActive ? 'active' : ''}>
        Informe
      </NavLink>
    </nav>
  );
}