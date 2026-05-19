// IMPORTA ESTILOS GLOBALES DE LA APLICACIÓN
import "./App.css";

// IMPORTA COMPONENTES DE RUTAS DE REACT ROUTER DOM
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

// IMPORTA PÁGINA DE INICIO DE SESIÓN
import Login from "./pages/Login";

// IMPORTA PÁGINA DE REGISTRO
import Register from "./pages/Register";

// IMPORTA DASHBOARD DE ADMINISTRADOR
import AdminDashboard from "./pages/AdminDashboard";

// IMPORTA DASHBOARD DE VISUALIZACIÓN
import ViewerDashboard from "./pages/ViewerDashboard";

// IMPORTA COMPONENTE PARA PROTEGER RUTAS (CONTROL DE ACCESO)
import ProtectedRoute from "./components/ProtectedRoute";

// COMPONENTE PRINCIPAL DE LA APLICACIÓN
function App() {

  return (

    // ENVOLTORIO DE RUTAS DEL NAVEGADOR
    <BrowserRouter>

      {/* DEFINICIÓN DE RUTAS DE LA APLICACIÓN */}
      <Routes>

        {/* RUTA DE LOGIN (PÁGINA PRINCIPAL) */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* RUTA DE REGISTRO DE USUARIOS */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* RUTA DE VISUALIZACIÓN DE ARCHIVOS */}
        <Route
          path="/viewer"
          element={<ViewerDashboard />}
        />

        {/* RUTA DE PANEL ADMINISTRATIVO PROTEGIDA */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>

              {/* COMPONENTE SOLO ACCESIBLE SI ESTÁ AUTENTICADO */}
              <AdminDashboard />

            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

// EXPORTA EL COMPONENTE PRINCIPAL DE LA APP
export default App;