import "./Navbar.css";

import { useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const logout = () => {

        localStorage.removeItem("token");

        navigate("/");
    };

    return (

        <div className="navbar">

            <div className="navbar-title">
                Sistema RI
            </div>

            <button onClick={logout}>
                Cerrar sesión
            </button>

        </div>
    );
}

export default Navbar;