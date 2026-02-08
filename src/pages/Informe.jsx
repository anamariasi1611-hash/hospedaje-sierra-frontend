import { useState, useEffect } from 'react';
import api from '../services/api';

// Define el componente para mostrar el informe del día y generar reportes PDF
export default function Informe() {
  // Estado para el informe del día (reservas vigentes)
  const [informeDia, setInformeDia] = useState([]);
  // Estados de carga y error general
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modal de detalles de compras
  const [showModalCompras, setShowModalCompras] = useState(false);
  const [detallesCompras, setDetallesCompras] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalError, setModalError] = useState('');

  // Estados para modal de vista previa PDF (reutilizable)
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('Vista Previa');

  // Carga informe del día al montar el componente
  useEffect(() => {
    const cargarInforme = async () => {
      try {
        // Obtiene informe del día desde el endpoint /api/reportes/dia
        const response = await api.get('/api/reportes/dia');
        setInformeDia(response.data || []);
      } catch (err) {
        console.error('Error cargando informe:', err);
        setError('No se pudo cargar el informe del día. Intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    cargarInforme();
  }, []);

  // Abre modal y carga detalles de una compra específica
  const verDetallesCompra = async (idCompra, huespedNombre) => {
    if (!idCompra) {
      alert('Esta reserva no tiene compras asociadas aún.');
      return;
    }

    setModalTitle(`Compras de ${huespedNombre || 'este huésped'}`);
    setModalError('');
    setDetallesCompras([]);
    setLoadingDetalles(true);
    setShowModalCompras(true);

    try {
      // Obtiene detalles de la compra
      const response = await api.get(`/api/compras/detalles/${idCompra}`);
      setDetallesCompras(response.data || []);
    } catch (err) {
      console.error('Error al cargar detalles de compras:', err);
      setModalError(
        err.response?.status === 404 
          ? 'No se encontraron detalles para esta compra.' 
          : 'Error al cargar los detalles de compras. Intenta de nuevo.'
      );
    } finally {
      setLoadingDetalles(false);
    }
  };

  // Cierra modal de compras y limpia estados
  const cerrarModalCompras = () => {
    setShowModalCompras(false);
    setDetallesCompras([]);
    setModalTitle('');
    setModalError('');
  };

  // Función reutilizable para generar y previsualizar PDF
  const previsualizarPdf = async (url, titulo) => {
    setPdfLoading(true);
    setPdfTitle(titulo);
    setShowPdfPreview(true);

    try {
      // Solicita PDF como blob
      const response = await api.get(url, {
        responseType: 'blob'
      });

      // Crea URL temporal para iframe
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfUrl(blobUrl);
    } catch (err) {
      console.error(`Error generando vista previa ${titulo}:`, err);
      alert(`No se pudo generar la vista previa de ${titulo}.`);
      setShowPdfPreview(false);
    } finally {
      setPdfLoading(false);
    }
  };

  // Descarga el PDF actualmente cargado
  const descargarPdfActual = (filename = 'reporte.pdf') => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  // Cierra vista previa y libera URL del blob
  const cerrarPreview = () => {
    setShowPdfPreview(false);
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  return (
    // Contenedor principal con margen superior
    <div className="container-fluid mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Informe del Día</h2>
      </div>

      {/* Mensaje de error general */}
      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        // Loading del informe principal
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}></div>
          <p className="mt-4 fs-5">Cargando informe del día...</p>
        </div>
      ) : informeDia.length === 0 ? (
        // Caso sin reservas vigentes
        <div className="alert alert-info text-center py-5">
          No hay reservas vigentes hoy para generar informe
        </div>
      ) : (
        <>
          {/* Tabla principal de reservas vigentes */}
          <div className="card shadow-sm border-0 mb-5">
            <div className="card-header text-white d-flex justify-content-between align-items-center py-3" style={{ background: '#142952' }}>
              <h5 className="mb-0">Reservas vigentes del día ({informeDia.length})</h5>
              <small>{new Date().toLocaleDateString('es-CO')}</small>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Hab.</th>
                      <th>Huésped</th>
                      <th>Cédula</th>
                      <th>Entrada → Salida</th>
                      <th>Servicios</th>
                      <th>Habitación</th>
                      <th>Total</th>
                      <th>Compras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {informeDia.map(item => (
                      <tr key={item.idReserva}>
                        <td>Hab. {item.habitacion}</td>
                        <td>{item.huesped}</td>
                        <td>{item.cedula}</td>
                        <td>{item.fechaEntrada} → {item.fechaSalida}</td>
                        <td>${(item.totalServicios || 0).toLocaleString('es-CO')}</td>
                        <td>${(item.costoHabitacion || 0).toLocaleString('es-CO')}</td>
                        <td className="fw-bold">${(item.totalFinal || 0).toLocaleString('es-CO')}</td>
                        <td>
                          {item.idCompra ? (
                            // Botón para ver detalles de compras
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => verDetallesCompra(item.idCompra, item.huesped)}
                            >
                              Ver compras
                            </button>
                          ) : (
                            <span className="text-muted small">Sin compras</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sección de reportes PDF */}
          <div className="card shadow-sm border-0">
            <div className="card-header text-white" style={{ background: '#142952' }}>
              <h5 className="mb-0">Reportes Generales</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-3">
                {/* Reporte de Productos */}
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => previsualizarPdf('/api/reportes/pdf/productos', 'Lista de Productos')}
                    style={{ background: '#299425', borderColor: '#299425', fontWeight: 500 }}
                  >
                    <i className="bi bi-eye fs-5"></i>
                    Vista Previa - Productos
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => descargarPdfActual('productos_hospedaje_sierra.pdf')}
                    style={{ borderColor: '#142952', color: '#142952', fontWeight: 500 }}
                  >
                    <i className="bi bi-download fs-5"></i>
                    Descargar
                  </button>
                </div>

                {/* Reporte de Ocupación (mes actual) */}
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => previsualizarPdf('/api/reportes/pdf/ocupacion?mesAnio=2026-02', 'Uso de Habitaciones')}
                    style={{ background: '#299425', borderColor: '#299425', fontWeight: 500 }}
                  >
                    <i className="bi bi-eye fs-5"></i>
                    Vista Previa - Uso de Habitaciones
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => descargarPdfActual('ocupacion_hospedaje.pdf')}
                    style={{ borderColor: '#142952', color: '#142952', fontWeight: 500 }}
                  >
                    <i className="bi bi-download fs-5"></i>
                    Descargar
                  </button>
                </div>

                {/* Reporte de Ingresos Mensuales */}
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-primary btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => previsualizarPdf('/api/reportes/pdf/ingresos?mesAnio=2026-02', 'Ingresos Mensuales')}
                    style={{ background: '#299425', borderColor: '#299425', fontWeight: 500 }}
                  >
                    <i className="bi bi-eye fs-5"></i>
                    Vista Previa - Ingresos Mensuales
                  </button>
                  <button 
                    className="btn btn-outline-primary btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => descargarPdfActual('ingresos_hospedaje.pdf')}
                    style={{ borderColor: '#142952', color: '#142952', fontWeight: 500 }}
                  >
                    <i className="bi bi-download fs-5"></i>
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de detalles de compras */}
      {showModalCompras && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header" style={{ background: '#142952', color: 'white' }}>
                  <h5 className="modal-title">{modalTitle}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={cerrarModalCompras}></button>
                </div>

                <div className="modal-body">
                  {loadingDetalles ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-3">Cargando detalles de compras...</p>
                    </div>
                  ) : modalError ? (
                    <div className="alert alert-danger">{modalError}</div>
                  ) : detallesCompras.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-basket fs-1 d-block mb-3"></i>
                      <p>No hay productos comprados en esta cuenta</p>
                    </div>
                  ) : (
                    <>
                      {/* Tabla de detalles de compra */}
                      <div className="table-responsive mb-3">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Producto</th>
                              <th className="text-center">Cantidad</th>
                              <th className="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detallesCompras.map(detalle => (
                              <tr key={detalle.idDetalle}>
                                <td>{detalle.nombreProducto}</td>
                                <td className="text-center">{detalle.cantidad}</td>
                                <td className="text-end">${Number(detalle.subtotal).toLocaleString('es-CO')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Total de compras */}
                      <div className="text-end fw-bold fs-5 mt-3">
                        Total compras: $
                        {detallesCompras
                          .reduce((sum, d) => sum + (Number(d.subtotal) || 0), 0)
                          .toLocaleString('es-CO')}
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarModalCompras}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Modal reutilizable para vista previa de PDF */}
      {showPdfPreview && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header" style={{ background: '#142952', color: 'white' }}>
                  <h5 className="modal-title">{pdfTitle}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={cerrarPreview}></button>
                </div>
                <div className="modal-body p-0" style={{ height: '70vh' }}>
                  {pdfLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <p className="mt-3">Generando vista previa...</p>
                    </div>
                  ) : pdfUrl ? (
                    // Iframe para mostrar PDF
                    <iframe
                      src={pdfUrl}
                      title="Vista previa PDF"
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                    />
                  ) : (
                    <div className="text-center py-5 text-danger">
                      <p>Error al cargar la vista previa</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={cerrarPreview}>
                    Cerrar
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => descargarPdfActual(`${pdfTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`)}>
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
}