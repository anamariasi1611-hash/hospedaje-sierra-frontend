import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';  
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';

// Define el componente de login
export default function Login() {
  // Estados para credenciales
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);
  // Estado para mensaje de error
  const [error, setError] = useState('');
  // Estado para loading durante login
  const [isLoading, setIsLoading] = useState(false);

  // Obtiene función login del contexto y navigate
  const { login } = useAuth();
  const navigate = useNavigate();

  // Maneja envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Llama a login del contexto
    const result = await login(username.trim(), password);

    setIsLoading(false);

    // Navega a dashboard si éxito
    if (result.success) {
      navigate('/dashboard');
    } else {
      // Muestra mensaje de error
      setError(result.message);
    }
  };

  return (
    // Contenedor full height con grid
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Panel izquierdo con logo */}
        <div className="col-md-5 left-panel">
          <img src="/logo.png" alt="Logo Hospedaje Sierra" />
          <p className="mt-2">Todo el control, en un solo lugar.</p>
        </div>

        {/* Panel derecho con formulario */}
        <div className="col-md-7 right-panel d-flex align-items-center justify-content-center">
          <div className="login-card p-5 shadow-lg">
            <h2 className="text-center mb-4 fw-bold">Iniciar Sesión</h2>

            {/* Mensaje de error */}
            {error && (
              <div className="alert alert-danger text-center mb-4">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Usuario</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nombre de usuario"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Contraseña</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  {/* Botón toggle visibilidad contraseña */}
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Nota sobre contraseña olvidada */}
              <div className="mb-3 text-end">
                <p className="text-muted">
                  ¿Olvidaste tu contraseña? Contacta al administrador para que la resetee desde el panel.
                </p>
              </div>

              {/* Botón submit con loading */}
              <button
                type="submit"
                className="btn btn-orange w-100"
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}