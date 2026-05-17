import "./Register.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Register() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const register = async () => {

        try {

            const res = await api.post("/auth/register", {
                username,
                password
            });

            if (res.data.mensaje) {

                alert("Usuario registrado correctamente");
                navigate("/");

            } else {

                alert(res.data.error);
            }

        } catch (error) {

            console.log(error);
            alert("Error de conexión con el servidor");
        }
    };

    return (

        <div className="register-container">

            <div className="register-box">

                <h1>Registro Admin</h1>

                <input
                    type="text"
                    placeholder="Usuario"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button onClick={register}>
                    Registrarse
                </button>

                <br /><br />

                <p
                    className="link"
                    onClick={() => navigate("/")}
                >
                    Ir al login
                </p>

            </div>

        </div>
    );
}

export default Register;