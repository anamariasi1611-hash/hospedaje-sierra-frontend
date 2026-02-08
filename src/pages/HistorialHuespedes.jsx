import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Define el componente para mostrar el historial de huéspedes registrados
export default function HistorialHuespedes() {
  const navigate = useNavigate();

  // Estado para la lista de huéspedes
  const [huespedes, setHuespedes] = useState([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para mensaje de error
  const [error, setError] = useState('');

  // Carga huéspedes al montar el componente
  useEffect(() => {
    const fetchHuespedes = async () => {
      try {
        // Obtiene todos los huéspedes desde el backend
        const response = await api.get('/api/huespedes');
        setHuespedes(response.data);
      } catch (err) {
        setError('Error al cargar huéspedes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHuespedes();
  }, []);

  // Muestra loading mientras carga
  if (loading) return <div className="text-center mt-5 py-5">Cargando huéspedes...</div>;

  return (
    // Contenedor principal
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Historial de Huéspedes</h2>

      {/* Mensaje de error si ocurre */}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* Caso vacío */}
      {huespedes.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No hay huéspedes registrados aún</p>
        </div>
      ) : (
        // Tabla responsive con lista de huéspedes
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Cédula</th>
              </tr>
            </thead>
            <tbody>
              {/* Renderiza filas de huéspedes */}
              {huespedes.map(h => (
                <tr key={h.idHuesped}>
                  <td>{h.idHuesped}</td>
                  <td>{h.nombres}</td>
                  <td>{h.apellidos}</td>
                  <td>{h.cedula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón volver al dashboard */}
      <div className="text-center mt-5">
        <button className="btn btn-outline-secondary px-5 py-3" onClick={() => navigate('/dashboard')}>
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}