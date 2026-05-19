/* IMPORTACION DE ESTILOS DEL REGISTRO */
import "./Register.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";

function Register() {

    /* CAMPOS DEL FORMULARIO */
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    /* MENSAJES DE ESTADO */
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const register = async () => {

        try {

            // LIMPIAR MENSAJES ANTES DE REGISTRAR
            setMensaje("");
            setError("");

            const res = await api.post(
                "/auth/register",
                {
                    username,
                    password
                }
            );

            // SI EL BACKEND RESPONDE CON MENSAJE ES EXITOSO
            if (res.data.mensaje) {

                setMensaje(
                    "Usuario registrado correctamente"
                );

                // REDIRECCION AL LOGIN DESPUES DE UN TIEMPO
                setTimeout(() => {
                    navigate("/");
                }, 1500);

            } else {

                setError(
                    res.data.error ||
                    "No se pudo registrar"
                );
            }

        } catch (error) {

            console.log(error);

            setError(
                "Error de conexion con el servidor"
            );
        }
    };

    return (

        <div className="register-container">

            <div className="register-box">

                <h1>Registro Admin</h1>

                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    onKeyDown={(e) =>
                        e.key === "Enter" && register()
                    }
                />

                <br /><br />

                {/* MENSAJE DE EXITO */}
                {mensaje && (
                    <div className="success-msg">
                        {mensaje}
                    </div>
                )}

                {/* MENSAJE DE ERROR */}
                {error && (
                    <div className="error-msg">
                        {error}
                    </div>
                )}

                <br />

                <button onClick={register}>
                    Registrarse
                </button>

                <br /><br />

                <p
                    className="link"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    Ir al login
                </p>

            </div>

        </div>
    );
}

export default Register;