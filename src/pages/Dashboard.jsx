import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../services/api';

// Define el componente principal del dashboard
export default function Dashboard() {
  // Obtiene si el usuario es admin desde el contexto de autenticación
  const { isAdmin } = useAuth();

  // Estado para la fecha actual del calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  // Estado para la fecha seleccionada en el calendario
  const [selectedDate, setSelectedDate] = useState(null);

  // Estado para las reservas vigentes del día seleccionado (o hoy)
  const [reservasDelDia, setReservasDelDia] = useState([]);
  // Estado para indicar si se están cargando las reservas
  const [loadingReservas, setLoadingReservas] = useState(true);

  // Carga todas las reservas al montar el componente
  useEffect(() => {
    const cargarReservas = async () => {
      try {
        // Obtiene todas las reservas desde el backend
        const response = await api.get('/api/reservas');

        // Normaliza fechas eliminando la parte de tiempo (si existe)
        const todas = response.data.map(r => ({
          ...r,
          fechaEntradaNorm: r.fechaEntrada.split('T')[0],
          fechaSalidaNorm: r.fechaSalida.split('T')[0]
        }));

        // Filtra reservas vigentes para hoy por defecto
        const hoy = new Date().toISOString().split('T')[0];
        const vigentesHoy = todas.filter(r => 
          r.fechaEntradaNorm <= hoy && r.fechaSalidaNorm >= hoy
        );

        // Actualiza estado con reservas de hoy
        setReservasDelDia(vigentesHoy);
        setLoadingReservas(false);
      } catch (err) {
        console.error('Error al cargar reservas:', err);
        setLoadingReservas(false);
      }
    };

    cargarReservas();
  }, []);

  // Refiltra reservas cuando cambia la fecha seleccionada
  useEffect(() => {
    if (loadingReservas) return;

    // Determina la fecha a filtrar (seleccionada o hoy)
    const fechaFiltro = selectedDate 
      ? selectedDate.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    // Vuelve a obtener reservas y filtra por la fecha seleccionada
    api.get('/api/reservas').then(res => {
      const filtradas = res.data.filter(r => {
        const entrada = r.fechaEntrada.split('T')[0];
        const salida = r.fechaSalida.split('T')[0];
        return entrada <= fechaFiltro && salida >= fechaFiltro;
      });
      setReservasDelDia(filtradas);
    }).catch(err => console.error(err));
  }, [selectedDate, loadingReservas]);

  // Navega al mes anterior
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  // Navega al mes siguiente
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  // Calcula datos del mes actual para renderizar el calendario
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : null;

  // Renderiza el calendario manualmente
  const renderCalendar = () => {
    const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    const rows = [];
    let cells = [];

    // Rellena celdas vacías antes del primer día
    for (let i = 0; i < firstDay; i++) {
      cells.push(<td key={`empty-${i}`} className="p-2" />);
    }

    // Genera celdas para cada día del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = day === todayDate;
      const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateStr;

      cells.push(
        <td
          key={day}
          className={`p-2 text-center calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          style={{ cursor: 'pointer', minWidth: '42px', height: '42px' }}
          onClick={() => setSelectedDate(new Date(year, month, day))}
        >
          {day}
        </td>
      );

      // Completa filas de 7 días
      if ((firstDay + day - 1) % 7 === 6 || day === daysInMonth) {
        rows.push(<tr key={`row-${rows.length}`}>{cells}</tr>);
        cells = [];
      }
    }

    return (
      // Contenedor del calendario con estilos
      <div className="calendar-container bg-white rounded shadow-sm overflow-hidden mx-auto" style={{ maxWidth: '420px' }}>
        {/* Header del calendario con navegación */}
        <div className="d-flex justify-content-between align-items-center p-3" style={{ background: '#142952', color: 'white' }}>
          <button className="btn btn-sm btn-light" onClick={prevMonth}>‹</button>
          <h5 className="mb-0 text-capitalize">{monthName}</h5>
          <button className="btn btn-sm btn-light" onClick={nextMonth}>›</button>
        </div>

        {/* Tabla del calendario */}
        <table className="table table-borderless m-0 text-center">
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              {days.map((d, index) => (
                <th key={index} className="py-2 text-muted small fw-normal">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };

  return (
    // Contenedor principal con grid responsive
    <div className="container-fluid py-4">
      <div className="row g-5">
        {/* Columna izquierda: registro y calendario */}
        <div className="col-lg-7 col-xxl-6">
          <div className="main-guest-card">
            {/* Título sección registro */}
            <h3 className="text-orange text-center mb-5 fw-bold fs-2">Registro de huéspedes</h3>

            {/* Botón para nuevo registro */}
            <div className="text-center mb-5">
              <Link to="/registro-huesped">
                <button className="btn btn-orange fw-bold btn-lg px-5 py-3">
                  Nuevo Registro de Huésped
                </button>
              </Link>
            </div>

            {/* Renderiza calendario */}
            {renderCalendar()}

            {/* Muestra fecha seleccionada */}
            {selectedDate && (
              <div className="text-center mt-4">
                <div className="badge px-4 py-2 fs-6" style={{ background: '#142952', color: 'white' }}>
                  Día seleccionado: {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            )}

            {/* Lista de reservas vigentes */}
            <div className="mt-5">
              <div className="card shadow-sm border-0">
                {/* Header de la card con conteo y fecha */}
                <div className="card-header d-flex justify-content-between align-items-center py-3 text-white" style={{ background: '#142952' }}>
                  <h5 className="mb-0">
                    Registros vigentes del día
                    <span className="badge bg-success text-white ms-3 px-3 py-2 fs-6">{reservasDelDia.length}</span>
                  </h5>
                  <small>{selectedDate ? selectedDate.toLocaleDateString('es-CO') : new Date().toLocaleDateString('es-CO')}</small>
                </div>

                {/* Body con loading, vacío o lista */}
                <div className="card-body p-4">
                  {loadingReservas ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                      <p className="mt-3 text-muted">Cargando reservas...</p>
                    </div>
                  ) : reservasDelDia.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-calendar2-x fs-1 d-block mb-3"></i>
                      <p>No hay reservas para {selectedDate ? 'esta fecha' : 'hoy'}</p>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {reservasDelDia.map(reserva => (
                        <div key={reserva.idReserva} className="list-group-item px-0 py-3 border-bottom">
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1 fw-bold text-dark">
                                Hab. {reserva.habitacion?.numero || '—'} • {reserva.huesped?.nombres} {reserva.huesped?.apellidos}
                              </h6>
                              <small className="text-muted d-block">
                                Cédula: {reserva.huesped?.cedula || '—'} • Acomp.: {reserva.cantidadAcompanantes || 0}
                              </small>
                              <small className="text-muted d-block">
                                {reserva.fechaEntrada} → {reserva.fechaSalida}
                              </small>
                            </div>
                            <span className="badge bg-success px-3 py-2 fs-6">Vigente</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: cards de acceso rápido */}
        <div className="col-lg-5 col-xxl-6">
          <div className="d-flex flex-column gap-4 h-100">
            {/* Card principal de habitaciones */}
            <div className="card shadow-lg border-0 rounded-3 overflow-hidden transition-all hover-lift">
              <div className="card-body text-center p-5" style={{ background: 'linear-gradient(135deg, #fff5eb 0%, #ffe8d1 100%)' }}>
                <i className="bi bi-house-door-fill text-orange display-1 mb-4"></i>
                <h4 className="card-title fw-bold text-dark mb-3">Habitaciones</h4>
                <p className="text-muted mb-4">
                  Gestiona las 7 habitaciones disponibles
                </p>
                <Link to="/habitaciones">
                  <button className="btn btn-orange btn-lg px-5 py-3 fw-bold shadow w-100">
                    Ver / Gestionar Habitaciones
                  </button>
                </Link>
              </div>
            </div>

            {/* Cards secundarias */}
            <div className="row g-4">
              {/* Card huéspedes */}
              <div className="col-12 col-md-6">
                <div className="card shadow-lg border-0 rounded-3 h-100 transition-all hover-lift">
                  <div className="card-body text-center p-4 d-flex flex-column justify-content-center">
                    <i className="bi bi-people-fill text-primary display-4 mb-3"></i>
                    <h5 className="card-title fw-bold mb-3">Historial de Huéspedes</h5>
                    <p className="text-muted mb-4 small">
                      Consulta todos los huéspedes registrados
                    </p>
                    <Link to="/historial-huespedes" className="mt-auto">
                      <button className="btn btn-outline-primary btn-lg w-100 py-3 fw-bold">
                        Ver / Gestionar Huéspedes
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card reservas */}
              <div className="col-12 col-md-6">
                <div className="card shadow-lg border-0 rounded-3 h-100 transition-all hover-lift">
                  <div className="card-body text-center p-4 d-flex flex-column justify-content-center">
                    <i className="bi bi-calendar-check-fill text-success display-4 mb-3"></i>
                    <h5 className="card-title fw-bold mb-3">Historial de Reservas</h5>
                    <p className="text-muted mb-4 small">
                      Consulta y cancela reservas vigentes
                    </p>
                    <Link to="/historial-reservas" className="mt-auto">
                      <button className="btn btn-outline-success btn-lg w-100 py-3 fw-bold">
                        Ver / Gestionar Reservas
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones exclusivos para administradores */}
      {isAdmin && (
        <div className="text-center mt-5 d-flex justify-content-center gap-4 flex-wrap">
          <Link to="/register">
            <button className="btn btn-orange fw-bold btn-registrar" style={{ fontSize: '1.4rem', padding: '18px 50px', minWidth: '280px' }}>
              Registrar nuevo empleado
            </button>
          </Link>
          <Link to="/empleados">
            <button className="btn btn-orange fw-bold btn-registrar" style={{ fontSize: '1.4rem', padding: '18px 50px', minWidth: '280px' }}>
              Ver / Gestionar Empleados
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}