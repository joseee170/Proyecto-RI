import "./UploadForm.css";

import {
    useState,
    useRef
} from "react";

import api from "../api/api";

function UploadForm({ actualizar }) {

    const [archivo, setArchivo] = useState(null);

    const [keywords, setKeywords] = useState("");

    const [loading, setLoading] = useState(false);

    // NUEVOS ESTADOS
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const fileInputRef = useRef(null);

    const subirArchivo = async () => {

        // LIMPIAR MENSAJES
        setMensaje("");
        setError("");

        if (!archivo) {

            setError("Selecciona un archivo");

            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append(
                "archivo",
                archivo
            );

            formData.append(
                "keywords",
                keywords
            );

            const res = await api.post(
                "/files/upload",
                formData,
                {
                    headers: {
                        Authorization:
                            localStorage.getItem("token")
                    }
                }
            );

            // ERROR BACKEND
            if (res.data.error) {

                setError(
                    res.data.error
                );

            } else {

                setMensaje(
                    res.data.mensaje
                );

                // BORRAR MENSAJE AUTOMATICAMENTE
                setTimeout(() => {

                    setMensaje("");

                }, 1000);

                setArchivo(null);

                setKeywords("");

                if (fileInputRef.current) {

                    fileInputRef.current.value = "";
                }

                actualizar();
            }

        } catch (error) {

            console.log(error);

            setError(
                "Error al subir archivo"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <div className="upload-container">

            <h2>

                Subir Archivo

            </h2>

            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) =>
                    setArchivo(
                        e.target.files[0]
                    )
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

            <button
                onClick={subirArchivo}
                disabled={loading}
            >
                {
                    loading
                    ? "Subiendo..."
                    : "Subir"
                }
            </button>

        </div>
    );
}

export default UploadForm;