import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const login = async () => {

        const res = await axios.post(
            "http://localhost:3001/login",
            {
                username,
                password
            }
        );

        if(res.data.token){

            localStorage.setItem(
                "token",
                res.data.token
            );

            navigate("/admin");
        }
        else{

            alert(res.data.error);
        }
    };

    return (

        <div className="login-container">

            <div className="login-box">

                <h1>Login</h1>

                <input
                    type="text"
                    placeholder="Usuario"
                    onChange={(e) =>
                        setUsername(e.target.value)
                    }
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Contraseña"
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                />

                <br /><br />

                <button onClick={login}>
                    Ingresar
                </button>

                <p
                    className="link"
                    onClick={() => navigate("/register")}
                >
                    Crear cuenta
                </p>

                <br />

                <p
                    className="link"
                    onClick={() => navigate("/viewer")}
                >
                    Entrar como visitante
                </p>

            </div>

        </div>
    );
}

export default Login;