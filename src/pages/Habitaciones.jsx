import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Define el componente para gestionar habitaciones
export default function Habitaciones() {
  // Obtiene si el usuario es admin para controlar permisos de edición
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Estado para la lista de habitaciones
  const [habitaciones, setHabitaciones] = useState([]);
  // Estado para la habitación actualmente seleccionada
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  // Estado para indicar si se está en modo edición
  const [editando, setEditando] = useState(false);
  // Estado para los datos del formulario de edición
  const [formData, setFormData] = useState({});
  // Estados para loading, error y éxito
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para observaciones
  const [observaciones, setObservaciones] = useState([]);
  const [showObservacionesModal, setShowObservacionesModal] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState('');

  // URL placeholder para imágenes faltantes
  const PLACEHOLDER_URL = 'https://picsum.photos/600/400?text=Sin+Imagen';

  // Carga todas las habitaciones al montar el componente
  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        // Obtiene habitaciones desde el backend
        const response = await api.get('/api/habitaciones');
        setHabitaciones(response.data);
      } catch (err) {
        setError('Error al cargar habitaciones');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHabitaciones();
  }, []);

  // Carga observaciones y inicializa formulario cuando cambia la habitación seleccionada
  useEffect(() => {
    if (habitacionSeleccionada?.idHabitacion) {
      const fetchObservaciones = async () => {
        try {
          // Obtiene observaciones de la habitación seleccionada
          const res = await api.get(`/api/observaciones/habitacion/${habitacionSeleccionada.idHabitacion}`);
          setObservaciones(res.data);
        } catch (err) {
          console.error('Error cargando observaciones:', err);
        }
      };
      fetchObservaciones();

      // Inicializa datos del formulario con valores actuales
      setFormData({
        personas: habitacionSeleccionada.personas || '',
        precio: habitacionSeleccionada.precio || '',
        estado: habitacionSeleccionada.estado || 'DISPONIBLE',
        imagenUrl: habitacionSeleccionada.imagenUrl || '',
      });
      setEditando(false);
      setError('');
      setSuccess('');
    }
  }, [habitacionSeleccionada]);

  // Maneja selección de habitación
  const handleSeleccionar = (hab) => {
    setHabitacionSeleccionada(hab);
  };

  // Maneja cambios en inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'personas' ? parseInt(value) || '' :
              name === 'precio' ? parseFloat(value) || '' :
              value,
    }));
  };

  // Envía actualización parcial de habitación
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!habitacionSeleccionada) return;

    setError('');
    setSuccess('');

    try {
      // Prepara objeto con solo los campos permitidos
      const updates = { estado: formData.estado };

      if (isAdmin) {
        updates.personas = formData.personas;
        updates.precio = formData.precio;
        updates.imagenUrl = formData.imagenUrl?.trim() || null;
      }

      // Envía PATCH al backend
      const res = await api.patch(
        `/api/habitaciones/${habitacionSeleccionada.idHabitacion}`,
        updates
      );

      // Actualiza estados localmente
      setHabitacionSeleccionada(res.data);
      setHabitaciones(prev => prev.map(h => h.idHabitacion === res.data.idHabitacion ? res.data : h));

      setSuccess('Habitación actualizada correctamente');
      setEditando(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data || 'No se pudo actualizar');
      console.error(err);
    }
  };

  // Guarda nueva observación
  const guardarObservacion = async () => {
    if (!nuevoComentario.trim()) {
      setError('Escribe un comentario');
      return;
    }

    try {
      // Envía nueva observación al backend
      await api.post('/api/observaciones', {
        idHabitacion: habitacionSeleccionada.idHabitacion,
        comentario: nuevoComentario.trim()
      });

      // Recarga observaciones
      const res = await api.get(`/api/observaciones/habitacion/${habitacionSeleccionada.idHabitacion}`);
      setObservaciones(res.data);
      setNuevoComentario('');
      setSuccess('Observación guardada');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al guardar observación');
      console.error(err);
    }
  };

  // Elimina observación (solo admin)
  const eliminarObservacion = async (idObservacion) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta observación?')) return;

    try {
      // Envía DELETE al backend
      await api.delete(`/api/observaciones/${idObservacion}`);
      // Actualiza lista local
      setObservaciones(prev => prev.filter(o => o.idObservacion !== idObservacion));
      setSuccess('Observación eliminada');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al eliminar');
      console.error(err);
    }
  };

  // Devuelve clase CSS según estado de habitación
  const getColorClass = (estado) => {
    switch (estado) {
      case 'DISPONIBLE': return 'bg-success text-white';
      case 'EN_LIMPIEZA': return 'bg-primary text-white';
      case 'OCUPADA': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  // Muestra loading mientras carga
  if (loading) return <div className="text-center mt-5 py-5">Cargando habitaciones...</div>;

  return (
    // Contenedor principal
    <div className="container mt-4">
      <h2 className="mb-4 text-center">Gestión de Habitaciones</h2>

      <div className="row">
        {/* Lista de habitaciones izquierda */}
        <div className="col-md-4">
          <div className="list-group">
            {habitaciones.map(hab => (
              <button
                key={hab.idHabitacion}
                className={`list-group-item text-center fw-bold mb-2 ${habitacionSeleccionada?.idHabitacion === hab.idHabitacion ? 'active' : ''}`}
                onClick={() => handleSeleccionar(hab)}
              >
                Habitación {hab.numero}
              </button>
            ))}
          </div>
        </div>

        {/* Detalle de habitación derecha */}
        <div className="col-md-8">
          {habitacionSeleccionada ? (
            <div className="card shadow">
              {/* Header con número de habitación */}
              <div className="card-header text-white text-center" style={{ backgroundColor: '#12264A' }}>
                <h4>Habitación {habitacionSeleccionada.numero}</h4>
              </div>

              <div className="card-body">
                {/* Mensajes de éxito/error */}
                {success && <div className="alert alert-success text-center">{success}</div>}
                {error && <div className="alert alert-danger text-center">{error}</div>}

                {/* Vista normal (sin edición) */}
                {!editando ? (
                  <div>
                    {/* Estado con badge coloreado */}
                    <p className="text-center mb-4">
                      <strong>Estado:</strong>{' '}
                      <span className={`badge fs-5 px-4 py-2 ${getColorClass(habitacionSeleccionada.estado)}`}>
                        {habitacionSeleccionada.estado === 'DISPONIBLE'
                          ? 'Disponible'
                          : habitacionSeleccionada.estado === 'EN_LIMPIEZA'
                          ? 'En limpieza'
                          : 'Ocupada'}
                      </span>
                    </p>

                    {/* Capacidad y precio */}
                    <div className="text-center mb-4">
                      <p><strong>Capacidad:</strong> {habitacionSeleccionada.personas} personas</p>
                      <p><strong>Precio/noche:</strong> ${habitacionSeleccionada.precio?.toLocaleString() || '—'}</p>
                    </div>

                    {/* Imagen con fallback */}
                    <div className="text-center mb-4">
                      <img
                        src={habitacionSeleccionada.imagenUrl || PLACEHOLDER_URL}
                        alt={`Habitación ${habitacionSeleccionada.numero}`}
                        className="img-fluid rounded shadow"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                        onError={e => e.target.src = PLACEHOLDER_URL}
                      />
                    </div>

                    {/* Botón para abrir modal de observaciones */}
                    <div className="text-center mb-4">
                      <button
                        className="btn btn-info position-relative px-4 py-2 fw-bold"
                        onClick={() => setShowObservacionesModal(true)}
                      >
                        Observaciones
                        {observaciones.length > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {observaciones.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Botón para entrar en modo edición */}
                    <button
                      className="btn btn-orange w-100 py-3 fw-bold"
                      onClick={() => setEditando(true)}
                    >
                      Modificar Información
                    </button>
                  </div>
                ) : (
                  // Formulario de edición
                  <form onSubmit={handleSubmit}>
                    {/* Selección de estado */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Estado</label>
                      <select name="estado" className="form-select" value={formData.estado} onChange={handleChange} required>
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="EN_LIMPIEZA">En limpieza</option>
                        <option value="OCUPADA">Ocupada</option>
                      </select>
                    </div>

                    {/* Capacidad (solo admin) */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Capacidad (personas)</label>
                      <input
                        type="number"
                        name="personas"
                        className="form-control"
                        value={formData.personas}
                        onChange={handleChange}
                        disabled={!isAdmin}
                        min="1"
                        required
                      />
                      {!isAdmin && <small className="text-muted">Solo admin puede modificar</small>}
                    </div>

                    {/* Precio (solo admin) */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Precio por noche</label>
                      <input
                        type="number"
                        name="precio"
                        className="form-control"
                        value={formData.precio}
                        onChange={handleChange}
                        step="0.01"
                        disabled={!isAdmin}
                        required
                      />
                      {!isAdmin && <small className="text-muted">Solo admin puede modificar</small>}
                    </div>

                    {/* URL de imagen (solo admin) */}
                    {isAdmin && (
                      <div className="mb-4">
                        <label className="form-label fw-bold">URL de la imagen (externa)</label>
                        <input
                          type="url"
                          name="imagenUrl"
                          className="form-control"
                          value={formData.imagenUrl || ''}
                          onChange={handleChange}
                          placeholder="https://i.imgur.com/ejemplo.jpg o deja vacío"
                        />
                        <small className="text-muted d-block mt-1">
                          Pega una URL pública. Deja vacío para quitarla.
                        </small>

                        {/* Vista previa de imagen */}
                        {formData.imagenUrl && (
                          <div className="mt-3 text-center">
                            <img
                              src={formData.imagenUrl}
                              alt="Vista previa"
                              className="img-thumbnail shadow"
                              style={{ maxHeight: '220px' }}
                              onError={e => e.target.src = PLACEHOLDER_URL}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botones guardar/cancelar */}
                    <div className="d-flex gap-3 mt-4">
                      <button type="submit" className="btn btn-orange flex-grow-1 py-2 fw-bold">
                        Guardar Cambios
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary flex-grow-1 py-2"
                        onClick={() => setEditando(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ) : (
            // Mensaje cuando no hay habitación seleccionada
            <div className="alert alert-info text-center p-5">
              <h5>Selecciona una habitación</h5>
              <p>Haz clic en uno de los números de la izquierda para ver o modificar.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de observaciones */}
      {showObservacionesModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              {/* Header del modal */}
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  Observaciones - Habitación {habitacionSeleccionada?.numero}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowObservacionesModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Lista de observaciones existentes */}
                {observaciones.length === 0 ? (
                  <p className="text-center text-muted py-4">No hay observaciones para esta habitación</p>
                ) : (
                  <div className="list-group mb-4">
                    {observaciones.map(obs => (
                      <div key={obs.idObservacion} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <small className="text-muted d-block">
                              {new Date(obs.fecha).toLocaleString('es-CO')} - {obs.empleado?.nombre || 'Empleado'}
                            </small>
                            <p className="mb-1">{obs.comentario}</p>
                          </div>
                          {/* Botón eliminar solo para admin */}
                          {isAdmin && (
                            <button
                              className="btn btn-sm btn-danger ms-2"
                              onClick={() => eliminarObservacion(obs.idObservacion)}
                            >
                              Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulario para nueva observación */}
                <div className="mt-4">
                  <label className="form-label fw-bold">Agregar nueva observación</label>
                  <textarea
                    className="form-control mb-2"
                    rows="4"
                    placeholder="Escribe aquí tu comentario o nota sobre la habitación..."
                    value={nuevoComentario}
                    onChange={e => setNuevoComentario(e.target.value)}
                  />
                  <button
                    className="btn btn-primary w-100"
                    onClick={guardarObservacion}
                    disabled={!nuevoComentario.trim()}
                  >
                    Guardar Comentario
                  </button>
                </div>
              </div>
              {/* Footer del modal */}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowObservacionesModal(false)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
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