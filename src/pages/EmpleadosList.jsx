import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Define el componente para listar y gestionar empleados (solo admins)
export default function EmpleadosList() {
  // Obtiene si el usuario es admin desde el contexto
  const { isAdmin } = useAuth();

  // Estado para la lista de empleados
  const [empleados, setEmpleados] = useState([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para mensajes de error
  const [error, setError] = useState('');
  // Estado para mensajes de éxito
  const [success, setSuccess] = useState('');

  // Efecto que se ejecuta al montar: verifica admin y carga empleados
  useEffect(() => {
    if (!isAdmin) {
      // Bloquea acceso si no es admin
      setError('Acceso denegado: solo administradores pueden ver esta sección');
      setLoading(false);
      return;
    }

    const fetchEmpleados = async () => {
      try {
        // Obtiene lista de empleados desde el backend
        const response = await api.get('/api/auth/empleados');
        setEmpleados(response.data);
      } catch (err) {
        // Maneja error en la petición
        setError('Error al cargar la lista de empleados');
        console.error('Error completo:', err.response || err);
      } finally {
        // Finaliza loading
        setLoading(false);
      }
    };

    fetchEmpleados();
  }, [isAdmin]);

  // Maneja eliminación de empleado
  const handleDelete = async (id) => {
    // Confirma acción con el usuario
    if (!window.confirm('¿Realmente quieres eliminar este empleado? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Llama al endpoint de eliminación
      await api.delete(`/api/auth/empleados/${id}`);
      // Actualiza lista local removiendo el empleado eliminado
      setEmpleados(empleados.filter(emp => emp.idEmpleado !== id));
      // Muestra mensaje de éxito
      setSuccess('Empleado eliminado correctamente');
      // Limpia mensaje después de 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Maneja error (e.g., intento de eliminar cuenta propia)
      setError(err.response?.data || 'Error al eliminar empleado');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Maneja reseteo de contraseña
  const handleResetPassword = async (id) => {
    // Solicita nueva contraseña
    const nuevaPassword = window.prompt('Ingresa la nueva contraseña para el empleado:');
    if (!nuevaPassword || nuevaPassword.trim() === '') {
      setError('Contraseña vacía cancelada');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      // Llama al endpoint de reseteo
      await api.post('/api/auth/reset-by-admin', {
        id,
        nuevaPassword: nuevaPassword.trim()
      });
      // Muestra éxito
      setSuccess('Contraseña reseteada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Maneja error (e.g., reseteo de cuenta propia)
      setError(err.response?.data || 'Error al resetear contraseña');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    // Contenedor principal
    <div className="container-fluid py-4">
      <h2 className="text-center mb-5 fw-bold text-orange">Gestión de Empleados</h2>

      {/* Muestra mensaje de éxito */}
      {success && (
        <div className="alert alert-success text-center" role="alert">
          {success}
        </div>
      )}

      {/* Muestra mensaje de error */}
      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {/* Estados de carga o acceso denegado */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Cargando empleados...</p>
        </div>
      ) : !isAdmin ? (
        <div className="alert alert-warning text-center">
          <strong>Acceso restringido:</strong> Solo administradores pueden gestionar empleados.
        </div>
      ) : (
        // Tabla con lista de empleados
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Cédula</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {/* Renderiza filas de empleados */}
              {empleados.map(emp => (
                <tr key={emp.idEmpleado}>
                  <td>{emp.nombreUsuario}</td>
                  <td>{emp.nombreCompleto}</td>
                  <td>{emp.email || '—'}</td>
                  <td>
                    {/* Badge con color según rol */}
                    <span className={`badge ${emp.rol === 'ADMIN' ? 'bg-danger' : 'bg-success'}`}>
                      {emp.rol}
                    </span>
                  </td>
                  <td>{emp.cedula || '—'}</td>
                  <td>
                    {/* Botón para resetear contraseña */}
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleResetPassword(emp.idEmpleado)}
                    >
                      Resetear Contraseña
                    </button>
                    {/* Botón para eliminar, deshabilitado para ADMINs */}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(emp.idEmpleado)}
                      disabled={emp.rol === 'ADMIN'}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}