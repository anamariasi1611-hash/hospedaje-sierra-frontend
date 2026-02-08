import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/global.css';

// Define el componente para registrar nuevos empleados (solo accesible por ADMIN)
export default function Register() {
  // Estado con todos los campos del formulario
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    nombreCompleto: '',
    cedula: '',
    email: '',
    password: '',
    rol: 'EMPLEADO' // valor por defecto
  });

  // Estado para confirmar contraseña (no se envía al backend)
  const [confirmPassword, setConfirmPassword] = useState('');
  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Estados para feedback al usuario
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Maneja cambios en cualquier input del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Limpia error al escribir (mejora UX)
    if (error) setError('');
  };

  // Valida todo el formulario antes de enviar
  const validateForm = () => {
    // 1. Campos obligatorios
    if (!formData.nombreUsuario.trim()) return 'El nombre de usuario es obligatorio';
    if (!formData.nombreCompleto.trim()) return 'El nombre completo es obligatorio';
    if (!formData.cedula.trim()) return 'La cédula es obligatoria';
    if (!formData.email.trim()) return 'El email es obligatorio (necesario para recuperar contraseña)';
    if (!formData.password) return 'La contraseña es obligatoria';

    // 2. Nombre completo → solo letras y espacios (incluye acentos y ñ)
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formData.nombreCompleto.trim())) {
      return 'El nombre completo solo puede contener letras y espacios';
    }

    // 3. Cédula → solo números, entre 6 y 12 dígitos
    if (!/^\d{6,12}$/.test(formData.cedula.trim())) {
      return 'La cédula debe contener solo números (6 a 12 dígitos)';
    }

    // 4. Email con formato básico válido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return 'El email no tiene un formato válido (ej: ejemplo@dominio.com)';
    }

    // 5. Contraseña robusta (mínimo 8 caracteres, mayúscula, minúscula, número, símbolo)
    if (formData.password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(formData.password)) return 'La contraseña debe tener al menos una mayúscula';
    if (!/[a-z]/.test(formData.password)) return 'La contraseña debe tener al menos una minúscula';
    if (!/[0-9]/.test(formData.password)) return 'La contraseña debe tener al menos un número';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      return 'La contraseña debe tener al menos un símbolo (!@#$%^&*...)';
    }

    // 6. Contraseñas coinciden
    if (formData.password !== confirmPassword) return 'Las contraseñas no coinciden';

    // 7. Nombre de usuario diferente del nombre completo (quitando espacios)
    if (
      formData.nombreUsuario.trim().toLowerCase() ===
      formData.nombreCompleto.trim().toLowerCase().replace(/\s+/g, '')
    ) {
      return 'El nombre de usuario no puede ser igual al nombre completo';
    }

    return null; // validación pasada
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validación frontend antes de llamar al backend
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // Envía datos al endpoint de registro (solo ADMIN puede llamar este endpoint)
      await api.post('/api/auth/register', formData);

      // Mensaje de éxito y redirección automática
      setSuccess('Empleado registrado correctamente. Redirigiendo...');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      // Manejo de errores del backend (duplicados, permisos, etc.)
      const msg = err.response?.data?.message || err.response?.data || 'Error al registrar el empleado';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Layout full height con dos columnas (logo + formulario)
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Panel izquierdo - logo y texto */}
        <div className="col-md-5 left-panel">
          <img src="/logo.png" alt="Logo Hospedaje Sierra" />
          <p className="mt-2">Todo el control, en un solo lugar.</p>
        </div>

        {/* Panel derecho - formulario de registro */}
        <div className="col-md-7 d-flex align-items-center justify-content-center">
          <div className="w-75">
            <h3 className="text-center mb-4">Registrarse</h3>

            {/* Alertas de éxito o error */}
            {error && <div className="alert alert-danger text-center">{error}</div>}
            {success && <div className="alert alert-success text-center">{success}</div>}

            <form onSubmit={handleSubmit}>
              {/* Nombre de usuario */}
              <div className="mb-3">
                <input
                  type="text"
                  name="nombreUsuario"
                  className="form-control"
                  placeholder="Nombre de usuario *"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                  required
                />
                <small className="form-text text-muted">Solo letras, números y guiones bajos</small>
              </div>

              {/* Nombre completo */}
              <div className="mb-3">
                <input
                  type="text"
                  name="nombreCompleto"
                  className="form-control"
                  placeholder="Nombres y apellidos * (solo letras)"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Cédula */}
              <div className="mb-3">
                <input
                  type="text"
                  name="cedula"
                  className="form-control"
                  placeholder="Cédula * (solo números)"
                  value={formData.cedula}
                  onChange={handleChange}
                  required
                  maxLength={12}
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Correo electrónico"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Contraseña */}
              <div className="mb-3 input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="Contraseña * (mín. 8 car., mayús., minús., núm., símbolo)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-white border-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                </button>
              </div>

              {/* Confirmar contraseña */}
              <div className="mb-4 input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="form-control"
                  placeholder="Confirmar contraseña *"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-white border-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                </button>
              </div>

              {/* Selección de rol */}
              <div className="mb-4">
                <select
                  name="rol"
                  className="form-select"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                >
                  <option value="EMPLEADO">Empleado</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              {/* Botón de registro */}
              <button
                type="submit"
                className="btn btn-orange w-100 py-3 fw-bold"
                disabled={loading}
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            {/* Enlace de regreso al dashboard */}
            <div className="text-center mt-4">
              <button className="btn btn-link text-muted" onClick={() => navigate('/dashboard')}>
                ← Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}