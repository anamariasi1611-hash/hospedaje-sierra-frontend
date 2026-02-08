import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistroHuesped from './pages/RegistroHuesped';
import Ventas from './pages/Ventas';
import Informe from './pages/Informe';
import HistorialHuespedes from './pages/HistorialHuespedes';
import HistorialReservas from './pages/HistorialReservas';
import Habitaciones  from './pages/Habitaciones';
import Register from './pages/Register';
import EmpleadosList from './pages/EmpleadosList';
import ProtectedLayout from './components/ProtectedLayout'; 
import MainLayout from './components/layout/MainLayout';
import AdminRoute from './routes/AdminRoute';

// Componente principal que define todas las rutas de la app hotelera
function App() {
  return (
    <Routes>
      {/* Rutas públicas: solo login */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas: requieren login + layout principal */}
      <Route element={<ProtectedLayout />}>
        <Route element={<MainLayout />}>
          {/* Dashboard y páginas de usuario normal */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/informe" element={<Informe />} />
          <Route path="/habitaciones" element={<Habitaciones />} />
          <Route path="/registro-huesped" element={<RegistroHuesped />} />
          <Route path="/historial-huespedes" element={<HistorialHuespedes />} />
          <Route path="/historial-reservas" element={<HistorialReservas />} />

          {/* Rutas ADMIN: solo superusuarios */}
          <Route path="/register" element={<AdminRoute><Register /></AdminRoute>} />
          <Route path="/empleados" element={<AdminRoute><EmpleadosList /></AdminRoute>} />

          {/* Home redirige a dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* 404: todo lo demás va al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;