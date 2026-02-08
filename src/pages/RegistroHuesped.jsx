import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Define el componente para registrar un nuevo huésped y su reserva simultáneamente
export default function RegistroHuesped() {
  // Obtiene isAdmin del contexto (por si en el futuro se restringe algo extra)
  // eslint-disable-next-line no-unused-vars
  const { isAdmin } = useAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // Estado principal con datos del huésped y reserva
  const [huesped, setHuesped] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    fechaIngreso: '',
    fechaSalida: '',
    cantidadAcompanantes: 0,
  });

  // Estados para habitaciones disponibles y selección actual
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);

  // Estados de carga, error y éxito
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Placeholder para imágenes sin URL
  const PLACEHOLDER_URL = 'https://picsum.photos/600/400?text=Sin+Imagen';

  // Carga habitaciones disponibles al montar el componente
  useEffect(() => {
    const fetchDisponibles = async () => {
      try {
        // Endpoint que devuelve solo habitaciones con estado DISPONIBLE
        const response = await api.get('/api/habitaciones/disponibles');
        console.log('[DEBUG] Habitaciones disponibles cargadas:', response.data);

        setHabitacionesDisponibles(response.data);

        // Selecciona automáticamente la primera disponible (si hay)
        if (response.data.length > 0) {
          setHabitacionSeleccionada(response.data[0]);
        }
      } catch (err) {
        console.error('[ERROR] Fallo al cargar habitaciones:', err);
        setError('No se pudieron cargar las habitaciones disponibles');
      } finally {
        setLoading(false);
      }
    };
    fetchDisponibles();
  }, []);

  // Maneja cambios en inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHuesped(prev => ({
      ...prev,
      [name]: name === 'cantidadAcompanantes' ? parseInt(value) || 0 : value,
    }));
  };

  // Incrementa cantidad de acompañantes
  const incrementarAcompanantes = () => {
    setHuesped(prev => ({
      ...prev,
      cantidadAcompanantes: prev.cantidadAcompanantes + 1,
    }));
  };

  // Decrementa cantidad de acompañantes (mínimo 0)
  const decrementarAcompanantes = () => {
    setHuesped(prev => ({
      ...prev,
      cantidadAcompanantes: Math.max(0, prev.cantidadAcompanantes - 1),
    }));
  };

  // Resetea cantidad de acompañantes a 0
  const resetAcompanantes = () => {
    setHuesped(prev => ({ ...prev, cantidadAcompanantes: 0 }));
  };

  // Maneja el registro completo (huésped + reserva)
  const handleRegistrar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones básicas frontend
    if (!huesped.nombres.trim() || !huesped.apellidos.trim() || !huesped.cedula.trim()) {
      setError('Completa los datos del huésped');
      return;
    }

    if (!huesped.fechaIngreso || !huesped.fechaSalida) {
      setError('Selecciona fechas de ingreso y salida');
      return;
    }

    // Verifica que salida sea posterior a ingreso
    if (new Date(huesped.fechaSalida) <= new Date(huesped.fechaIngreso)) {
      setError('La fecha de salida debe ser posterior a la de ingreso');
      return;
    }

    if (!habitacionSeleccionada) {
      setError('Selecciona una habitación disponible');
      return;
    }

    try {
      // Prepara payload exacto que espera el backend (RegistroReservaRequest)
      const reservaData = {
        nombres: huesped.nombres.trim(),
        apellidos: huesped.apellidos.trim(),
        cedula: huesped.cedula.trim(),
        fechaEntrada: huesped.fechaIngreso,
        fechaSalida: huesped.fechaSalida,
        cantidadAcompanantes: huesped.cantidadAcompanantes,
        idHabitacion: habitacionSeleccionada.idHabitacion,
      };

      // Llama al endpoint que crea huésped si no existe y registra la reserva
      await api.post('/api/reservas', reservaData);

      setSuccess('¡Reserva registrada con éxito!');

      // Limpia formulario
      setHuesped({
        nombres: '',
        apellidos: '',
        cedula: '',
        fechaIngreso: '',
        fechaSalida: '',
        cantidadAcompanantes: 0,
      });

      // Recarga habitaciones disponibles (la seleccionada ahora estará ocupada)
      const dispResponse = await api.get('/api/habitaciones/disponibles');
      setHabitacionesDisponibles(dispResponse.data);

      // Selecciona la primera disponible restante (o null si no hay)
      if (dispResponse.data.length > 0) {
        setHabitacionSeleccionada(dispResponse.data[0]);
      } else {
        setHabitacionSeleccionada(null);
      }

      // Mensaje temporal
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      // Muestra error del backend (ej: habitación ya ocupada, fechas inválidas, etc.)
      setError(err.response?.data || 'Error al registrar la reserva');
      console.error('Error al registrar:', err);
    }
  };

  // Muestra loading mientras carga habitaciones
  if (loading) {
    return <div className="text-center mt-5 py-5">Cargando habitaciones disponibles...</div>;
  }

  return (
    // Contenedor principal con grid responsive
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-white py-3 rounded shadow" style={{ backgroundColor: '#12264A' }}>
        Registro de Huéspedes
      </h2>

      <div className="row g-4">
        {/* Columna izquierda: formulario del huésped */}
        <div className="col-lg-6">
          <div className="card shadow border-0">
            <div className="card-header text-white text-center py-3" style={{ backgroundColor: '#12264A' }}>
              <h5 className="mb-0">Datos del Huésped</h5>
            </div>
            <div className="card-body">
              {/* Mensajes de éxito y error */}
              {success && <div className="alert alert-success text-center">{success}</div>}
              {error && <div className="alert alert-danger text-center">{error}</div>}

              <form onSubmit={handleRegistrar}>
                {/* Nombres */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Nombres del huésped</label>
                  <input
                    type="text"
                    name="nombres"
                    className="form-control"
                    value={huesped.nombres}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Apellidos */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    className="form-control"
                    value={huesped.apellidos}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Cédula */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Cédula</label>
                  <input
                    type="text"
                    name="cedula"
                    className="form-control"
                    value={huesped.cedula}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Fechas de ingreso y salida */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Fecha de ingreso</label>
                    <input
                      type="date"
                      name="fechaIngreso"
                      className="form-control"
                      value={huesped.fechaIngreso}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Fecha de salida</label>
                    <input
                      type="date"
                      name="fechaSalida"
                      className="form-control"
                      value={huesped.fechaSalida}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Cantidad de acompañantes con botones +/- */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Cantidad de acompañantes</label>
                  <div className="input-group w-75 mx-auto">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={decrementarAcompanantes}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      name="cantidadAcompanantes"
                      className="form-control text-center"
                      value={huesped.cantidadAcompanantes}
                      onChange={handleChange}
                      min="0"
                      readOnly  // ← solo se modifica con botones
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={incrementarAcompanantes}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger ms-2"
                      onClick={resetAcompanantes}
                    >
                      Resetear
                    </button>
                  </div>
                </div>

                {/* Botón principal de registro */}
                <button type="submit" className="btn btn-orange w-100 py-3 fw-bold mt-3">
                  Registrar Reserva
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Columna derecha: selector de habitaciones disponibles */}
        <div className="col-lg-6">
          <div className="card shadow border-0">
            <div className="card-header text-white text-center py-3" style={{ backgroundColor: '#12264A' }}>
              <h5 className="mb-0">Habitaciones Disponibles</h5>
            </div>
            <div className="card-body py-5">
              {habitacionesDisponibles.length === 0 ? (
                <p className="text-center text-muted py-5">No hay habitaciones disponibles en este momento</p>
              ) : (
                <div className="d-flex flex-column align-items-center gap-4">
                  {/* Navegación con flechas y tarjeta centrada */}
                  <div className="d-flex align-items-center justify-content-center gap-4 w-100">
                    {/* Flecha izquierda */}
                    <button
                      className="btn btn-outline-primary btn-lg rounded-circle shadow"
                      style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}
                      onClick={() => {
                        const idx = habitacionesDisponibles.findIndex(h => h.idHabitacion === habitacionSeleccionada?.idHabitacion);
                        const prev = (idx - 1 + habitacionesDisponibles.length) % habitacionesDisponibles.length;
                        setHabitacionSeleccionada(habitacionesDisponibles[prev]);
                      }}
                    >
                      «
                    </button>

                    {/* Tarjeta de habitación seleccionada */}
                    {habitacionSeleccionada ? (
                      <div className="card bg-light border-0 shadow-lg text-center" style={{ width: '400px', maxWidth: '100%' }}>
                        <div className="card-body p-4">
                          {/* Imagen con fallback */}
                          <img
                            src={habitacionSeleccionada.imagenUrl || PLACEHOLDER_URL}
                            alt={`Habitación ${habitacionSeleccionada.numero}`}
                            className="img-fluid rounded mb-3 shadow"
                            style={{ height: '250px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = PLACEHOLDER_URL;
                              e.target.alt = 'Imagen no disponible';
                            }}
                          />

                          <h3 className="card-title mb-3 fw-bold">
                            Habitación {habitacionSeleccionada.numero}
                          </h3>

                          <p className="fs-5 mb-2">
                            <strong>Capacidad:</strong> {habitacionSeleccionada.personas} Personas
                          </p>

                          <p className="fs-5 mb-0">
                            <strong>Precio:</strong> ${habitacionSeleccionada.precio?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted">Cargando habitación...</p>
                    )}

                    {/* Flecha derecha */}
                    <button
                      className="btn btn-outline-primary btn-lg rounded-circle shadow"
                      style={{ width: '70px', height: '70px', fontSize: '1.8rem' }}
                      onClick={() => {
                        const idx = habitacionesDisponibles.findIndex(h => h.idHabitacion === habitacionSeleccionada?.idHabitacion);
                        const next = (idx + 1) % habitacionesDisponibles.length;
                        setHabitacionSeleccionada(habitacionesDisponibles[next]);
                      }}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}