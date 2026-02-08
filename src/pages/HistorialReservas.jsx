import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Define el componente para mostrar el historial completo de reservas
export default function HistorialReservas() {
  const navigate = useNavigate();

  // Estado para la lista de reservas
  const [reservas, setReservas] = useState([]);
  // Estado para indicar carga
  const [loading, setLoading] = useState(true);
  // Estado para mensaje de error
  const [error, setError] = useState('');
  // Estado para mensaje de éxito
  const [success, setSuccess] = useState('');

  // Carga reservas al montar el componente
  useEffect(() => {
    const fetchReservas = async () => {
      try {
        // Obtiene todas las reservas desde el backend
        const response = await api.get('/api/reservas');

        // Ordena reservas por fecha de entrada descendente (más recientes primero)
        const ordenadas = response.data.sort((a, b) => 
          new Date(b.fechaEntrada) - new Date(a.fechaEntrada)
        );

        setReservas(ordenadas);
      } catch (err) {
        console.error('[ERROR] Fallo al cargar reservas:', err);
        setError(err.response?.data?.message || 'No se pudieron cargar las reservas');
      } finally {
        setLoading(false);
      }
    };
    fetchReservas();
  }, []);

  // Maneja cancelación de reserva
  const cancelarReserva = async (idReserva, numeroHabitacion) => {
    // Confirma acción con el usuario
    if (!window.confirm(`¿Realmente deseas cancelar la reserva de la Habitación ${numeroHabitacion || '?'}?`)) {
      return;
    }

    try {
      // Envía DELETE al backend
      await api.delete(`/api/reservas/${idReserva}`);

      // Actualiza lista local removiendo la reserva cancelada
      setReservas(prev => prev.filter(r => r.idReserva !== idReserva));

      // Muestra éxito temporal
      setSuccess(`Reserva ${idReserva} cancelada. Habitación disponible de nuevo.`);
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('[ERROR] Fallo al cancelar:', err);
      setError(err.response?.data?.message || 'Error al cancelar');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Formatea fecha en español legible
  const mostrarFecha = (fechaStr) => {
    if (!fechaStr) return '—';
    if (typeof fechaStr !== 'string') return '—';

    const [year, month, day] = fechaStr.split('-');
    if (!year || !month || !day) return fechaStr;

    const meses = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    return `${parseInt(day, 10)} de ${meses[parseInt(month, 10) - 1]} de ${year}`;
  };

  // Muestra loading mientras carga
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando historial de reservas...</p>
      </div>
    );
  }

  return (
    // Contenedor principal
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Historial de Reservas</h2>

      {/* Alertas de error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Alertas de éxito */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Caso vacío */}
      {reservas.length === 0 ? (
        <div className="alert alert-info text-center py-5">
          No hay reservas registradas aún
        </div>
      ) : (
        // Tabla responsive con historial
        <div className="table-responsive">
          <table className="table table-striped table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>ID Reserva</th>
                <th>Huésped</th>
                <th>Cédula</th>
                <th>Habitación</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Acompañantes</th>
                <th>Precio Total</th>
                <th>Registrado por</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {/* Renderiza filas de reservas */}
              {reservas.map((reserva) => {
                // Determina si la reserva es futura (permite cancelación)
                const esFutura = reserva.fechaEntrada > new Date().toISOString().split('T')[0];

                return (
                  <tr key={reserva.idReserva}>
                    <td>{reserva.idReserva}</td>
                    <td>
                      {reserva.huesped?.nombres} {reserva.huesped?.apellidos || '—'}
                    </td>
                    <td>{reserva.huesped?.cedula || '—'}</td>
                    <td>{reserva.habitacion?.numero || '—'}</td>
                    <td>{mostrarFecha(reserva.fechaEntrada)}</td>
                    <td>{mostrarFecha(reserva.fechaSalida)}</td>
                    <td className="text-center">{reserva.cantidadAcompanantes || 0}</td>
                    <td>
                      ${reserva.precioTotalHabitacion?.toLocaleString('es-CO') || '—'}
                    </td>
                    <td>
                      {reserva.empleado?.nombreCompleto ||
                        reserva.empleado?.nombreUsuario ||
                        '—'}
                    </td>
                    <td>
                      {/* Botón cancelar solo para reservas futuras */}
                      {esFutura ? (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => cancelarReserva(reserva.idReserva, reserva.habitacion?.numero)}
                        >
                          Cancelar
                        </button>
                      ) : (
                        <span className="badge bg-secondary">Finalizada</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Botón volver al dashboard */}
      <div className="text-center mt-5">
        <button 
          className="btn btn-outline-secondary px-5 py-3 fw-bold"
          onClick={() => navigate('/dashboard')}
        >
          Volver al Dashboard
        </button>
      </div>
    </div>
  );
}