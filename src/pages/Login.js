import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";
import api from "../api/api";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const login = async () => {

        try {

            // LIMPIAR MENSAJES
            setMensaje("");
            setError("");

            const res = await api.post("/auth/login", {
                username,
                password
            });

            // LOGIN EXITOSO
            if (res.data.token) {

                localStorage.setItem(
                    "token",
                    res.data.token
                );

                setMensaje("Inicio de sesión correcto");

                setTimeout(() => {

                    navigate("/admin");

                }, 1000);

            } else {

                setError(
                    res.data.error ||
                    "Error al iniciar sesión"
                );
            }

        } catch (error) {

            console.log(error);

            setError("Error de conexión");
        }
    };

    return (

        <div className="login-container">

            <div className="login-box">

                <h1>Login</h1>

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
                        e.key === "Enter" && login()
                    }
                />

                <br /><br />

                {/* MENSAJE EXITO */}
                {mensaje && (

                    <div className="success-msg">

                        {mensaje}

                    </div>
                )}

                {/* MENSAJE ERROR */}
                {error && (

                    <div className="error-msg">

                        {error}

                    </div>
                )}

                <br />

                <button onClick={login}>

                    Ingresar

                </button>

                <p
                    className="link"
                    onClick={() =>
                        navigate("/register")
                    }
                >
                    Crear cuenta
                </p>

                <br />

                <p
                    className="link"
                    onClick={() =>
                        navigate("/viewer")
                    }
                >
                    Entrar como visitante
                </p>

            </div>

        </div>
    );
}

export default Login;