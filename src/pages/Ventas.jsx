/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import api from '../services/api';

// Componente que gestiona las ventas del día actual
export default function Ventas() {

  const [reservasHoy, setReservasHoy] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hoy = new Date().toISOString().split('T')[0];

  // Estados del modal Producto
  const [showProductoModal, setShowProductoModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentProducto, setCurrentProducto] = useState({ nombre: '', precio: '' });
  const [editingProductoId, setEditingProductoId] = useState(null);

  // Estados del modal Compra
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState(null);
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);

  // Carga inicial de reservas vigentes y productos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const resReservas = await api.get('/api/reservas');
        const vigentesHoy = resReservas.data.filter(r => 
          r.fechaEntrada <= hoy && r.fechaSalida >= hoy
        );
        setReservasHoy(vigentesHoy);

        const resProductos = await api.get('/api/productos');
        setProductos(resProductos.data || []);
      } catch (err) {
        setError('No se pudieron cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [hoy]);

  // Abre modal para crear producto
  const abrirModalCrearProducto = () => {
    setModalMode('create');
    setCurrentProducto({ nombre: '', precio: '' });
    setEditingProductoId(null);
    setShowProductoModal(true);
  };

  // Abre modal para editar producto
  const abrirModalEditarProducto = (prod) => {
    setModalMode('edit');
    setCurrentProducto({ nombre: prod.nombre, precio: prod.precio });
    setEditingProductoId(prod.idProducto);
    setShowProductoModal(true);
  };

  // Cierra modal de producto
  const cerrarModalProducto = () => {
    setShowProductoModal(false);
    setCurrentProducto({ nombre: '', precio: '' });
    setEditingProductoId(null);
  };

  // Guarda o actualiza producto
  const guardarProducto = async () => {
    if (!currentProducto.nombre.trim()) return setError('El nombre es obligatorio');
    if (!currentProducto.precio || Number(currentProducto.precio) <= 0) return setError('El precio debe ser mayor a 0');

    try {
      if (modalMode === 'create') {
        await api.post('/api/productos', { nombre: currentProducto.nombre.trim(), precio: Number(currentProducto.precio) });
        setSuccess('Producto creado correctamente');
      } else {
        await api.put(`/api/productos/${editingProductoId}`, { nombre: currentProducto.nombre.trim(), precio: Number(currentProducto.precio) });
        setSuccess('Producto actualizado correctamente');
      }
      const res = await api.get('/api/productos');
      setProductos(res.data || []);
      cerrarModalProducto();
    } catch (err) {
      setError('Error al guardar producto');
    }
  };

  // Elimina producto
  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/api/productos/${id}`);
      setSuccess('Producto eliminado');
      const res = await api.get('/api/productos');
      setProductos(res.data || []);
    } catch (err) {
      setError('Error al eliminar');
    }
  };

  // Abre modal para agregar compra a reserva
  const abrirModalAgregarCompra = (reservaId) => {
    setSelectedReservaId(reservaId);
    setSelectedProductoId('');
    setCantidad(1);
    setShowCompraModal(true);
  };

  // Cierra modal de compra
  const cerrarModalCompra = () => {
    setShowCompraModal(false);
    setSelectedReservaId(null);
    setSelectedProductoId('');
    setCantidad(1);
  };

  // Agrega producto a la cuenta de la reserva
  const guardarDetalleCompra = async () => {
    if (!selectedProductoId) return setError('Selecciona un producto');
    if (cantidad < 1) return setError('La cantidad debe ser al menos 1');

    try {
      const resCompra = await api.get(`/api/compras/por-reserva/${selectedReservaId}`);
      const idCompra = resCompra.data.idCompra;

      await api.post(`/api/compras/${idCompra}/detalles`, {
        idProducto: Number(selectedProductoId),
        cantidad: Number(cantidad)
      });

      setSuccess('Producto agregado a la cuenta');
      cerrarModalCompra();
    } catch (err) {
      setError('Error al agregar el producto');
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5 py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 fs-5">Cargando ventas del día...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4 text-center">Ventas del día - {new Date().toLocaleDateString('es-CO')}</h2>

      {error && <div className="alert alert-danger alert-dismissible fade show">{error}<button className="btn-close" onClick={() => setError('')}></button></div>}
      {success && <div className="alert alert-success alert-dismissible fade show">{success}<button className="btn-close" onClick={() => setSuccess('')}></button></div>}

      <div className="row g-4">
        {/* Reservas vigentes */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5>Reservas vigentes hoy ({reservasHoy.length})</h5>
            </div>
            <div className="card-body p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {reservasHoy.length === 0 ? (
                <p className="text-muted text-center py-5">No hay reservas activas hoy</p>
              ) : (
                <div className="list-group">
                  {reservasHoy.map(reserva => (
                    <div key={reserva.idReserva} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="fw-bold">Hab. {reserva.habitacion?.numero} — {reserva.huesped?.nombres} {reserva.huesped?.apellidos}</h6>
                          <small className="text-muted">
                            {reserva.fechaEntrada} → {reserva.fechaSalida}
                          </small>
                        </div>
                        <button className="btn btn-sm btn-warning" onClick={() => abrirModalAgregarCompra(reserva.idReserva)}>
                          + Agregar compras
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white d-flex justify-content-between">
              <h5>Productos</h5>
              <button className="btn btn-light btn-sm" onClick={abrirModalCrearProducto}>+ Nuevo</button>
            </div>
            <div className="card-body p-3" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {productos.length === 0 ? (
                <p className="text-muted text-center py-5">No hay productos</p>
              ) : (
                <table className="table table-sm table-hover">
                  <thead><tr><th>Nombre</th><th>Precio</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.idProducto}>
                        <td>{p.nombre}</td>
                        <td>${Number(p.precio).toLocaleString('es-CO')}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirModalEditarProducto(p)}>Editar</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarProducto(p.idProducto)}>Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Producto */}
      {showProductoModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>{modalMode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}</h5>
                  <button className="btn-close" onClick={cerrarModalProducto}></button>
                </div>
                <div className="modal-body">
                  <input type="text" className="form-control mb-3" placeholder="Nombre" value={currentProducto.nombre} onChange={e => setCurrentProducto({...currentProducto, nombre: e.target.value})} />
                  <input type="number" className="form-control" placeholder="Precio" value={currentProducto.precio} onChange={e => setCurrentProducto({...currentProducto, precio: e.target.value})} min="100" />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cerrarModalProducto}>Cancelar</button>
                  <button className="btn btn-primary" onClick={guardarProducto}>Guardar</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}

      {/* Modal Compra */}
      {showCompraModal && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5>Agregar producto a reserva #{selectedReservaId}</h5>
                  <button className="btn-close" onClick={cerrarModalCompra}></button>
                </div>
                <div className="modal-body">
                  <select className="form-select mb-3" value={selectedProductoId} onChange={e => setSelectedProductoId(e.target.value)}>
                    <option value="">Selecciona un producto...</option>
                    {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombre} — ${Number(p.precio).toLocaleString('es-CO')}</option>)}
                  </select>
                  <input type="number" className="form-control" min="1" value={cantidad} onChange={e => setCantidad(Math.max(1, Number(e.target.value)))} />
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={cerrarModalCompra}>Cancelar</button>
                  <button className="btn btn-primary" onClick={guardarDetalleCompra}>Agregar</button>
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