/* NAVBAR COMPONENTE */
import "./Navbar.css";

import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/api";

function Navbar() {

    //NAVEGACION ENTRE PAGINAS
    const navigate = useNavigate();

    //USERNAME DEL USUARIO
    const [username, setUsername] =
        useState("");

    //SE EJECUTA AL CARGAR EL COMPONENTE
    useEffect(() => {

        obtenerUsuario();

    }, []);

    //OBTENER USUARIO LOGEADO
    const obtenerUsuario = async () => {

        try {

            const token =
                localStorage.getItem("token");

            console.log("TOKEN:", token);

            const res =
                await api.get(
                    "/auth/me",
                    {
                        headers: {
                            Authorization: token
                        }
                    }
                );

            console.log("RESPUESTA:", res.data);

            if (res.data.username) {

                setUsername(res.data.username);
            }

        } catch (error) {

            console.log("ERROR:", error);
        }
    };

    //CERRAR SESION
    const logout = () => {

        localStorage.removeItem("token");

        navigate("/");
    };

    return (

        <div className="navbar">

            <div className="navbar-title">
                Sistema RI | {username}
            </div>

            <button onClick={logout}>
                Cerrar sesión
            </button>

        </div>
    );
}

export default Navbar;