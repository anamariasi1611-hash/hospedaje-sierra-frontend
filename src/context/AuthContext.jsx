/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Crea el contexto de autenticación para compartir estado globalmente
const AuthContext = createContext();

// Proveedor de autenticación que envuelve la aplicación
export function AuthProvider({ children }) {
  // Estado para indicar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Estado para el rol del usuario
  const [rol, setRol] = useState(null);
  // Estado para los datos completos del usuario
  const [user, setUser] = useState(null);
  // Estado para indicar si se está cargando la verificación inicial
  const [loading, setLoading] = useState(true);

  // Efecto que se ejecuta al montar el componente para verificar sesión existente
  useEffect(() => {
    const checkAuth = async () => {
      // Obtiene token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // No hay token → no autenticado
        setLoading(false);
        return;
      }

      try {
        // Llama al endpoint /api/auth/me para obtener datos del usuario actual
        const response = await api.get('/api/auth/me');

        // Si la llamada es exitosa, actualiza estados de autenticación
        setIsAuthenticated(true);
        setRol(response.data.rol || 'EMPLEADO');
        setUser(response.data);
      } catch (err) {
        // En caso de error (token inválido, expirado, etc.), limpia token y marca como no autenticado
        console.error('Error al verificar sesión inicial:', err.response?.data || err.message);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setRol(null);
        setUser(null);
      } finally {
        // Siempre finaliza el loading
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Función de login que recibe credenciales y maneja la autenticación
  const login = async (username, password) => {
    try {
      // Llama al endpoint de login con las credenciales
      const response = await api.post('/api/auth/login', { username, password });

      // Si la respuesta contiene token, lo guarda en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);

        // Actualiza estados con datos del usuario devueltos
        setIsAuthenticated(true);
        setRol(response.data.rol || 'EMPLEADO');
        setUser({
          username: response.data.username,
          nombreCompleto: response.data.nombreCompleto,
          rol: response.data.rol,
          email: response.data.email,
          cedula: response.data.cedula,
        });

        return { success: true };
      }
    } catch (err) {
      // Manejo detallado de errores para proporcionar mensajes útiles
      let message = 'Error desconocido al iniciar sesión';

      if (err.response) {
        // Errores específicos del backend
        if (err.response.status === 401) {
          message = 'Usuario o contraseña incorrectos';
        } else if (err.response.data?.message) {
          message = err.response.data.message;
        } else {
          message = `Error ${err.response.status}`;
        }
      } else if (err.request) {
        // Problemas de conexión
        message = 'No se pudo conectar con el servidor. ¿Está el backend corriendo?';
      }

      return {
        success: false,
        message,
      };
    }
  };

  // Función de logout que limpia estado y redirige
  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setRol(null);
    setUser(null);
    // Redirige al login
    window.location.href = '/login';
  };

  // Deriva si el usuario es ADMIN
  const isAdmin = rol === 'ADMIN';

  // Valor proporcionado por el contexto
  const value = {
    isAuthenticated,
    isAdmin,
    rol,
    user,
    loading,
    login,
    logout,
  };

  // Renderiza el proveedor con el valor del contexto
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};