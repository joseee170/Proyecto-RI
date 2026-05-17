import "./Navbar.css";

import {
    useEffect,
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import api from "../api/api";

function Navbar() {

    const navigate = useNavigate();

    const [username, setUsername] =
        useState("");

    useEffect(() => {

        obtenerUsuario();

    }, []);

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

                setUsername(
                    res.data.username
                );
            }

        } catch (error) {

            console.log("ERROR:", error);
        }
    };

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