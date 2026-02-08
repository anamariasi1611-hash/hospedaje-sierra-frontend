import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'      
import './styles/global.css'    

// Punto de entrada que inicializa la app con React Router y contexto de autenticación
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AuthProvider envuelve todo para manejar login/roles */}
    <AuthProvider>
      {/* BrowserRouter para las rutas */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)