/* PROTECTED ROUTE */
import { Navigate } from "react-router-dom";

//COMPONENTE PARA PROTEGER PAGINAS
function ProtectedRoute({ children }) {

    //SE OBTIENE EL TOKEN GUARDADO
    const token =
        localStorage.getItem("token");

    //SI NO HAY TOKEN SE REGRESA AL LOGIN
    if (!token) {

        return <Navigate to="/" />;
    }

    //SI HAY TOKEN SE PERMITE ENTRAR
    return children;
}

//SE EXPORTA EL COMPONENTE
export default ProtectedRoute;