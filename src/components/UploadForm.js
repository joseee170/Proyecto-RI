import "./UploadForm.css";

import { useState, useRef } from "react";
import api from "../api/api";

function UploadForm({ actualizar }) {

    // ARCHIVO SELECCIONADO
    const [archivo, setArchivo] = useState(null);

    // PALABRAS CLAVE (NO USADO ACTUALMENTE PERO LISTO PARA FUTURO)
    const [keywords, setKeywords] = useState("");

    // ESTADO DE CARGA
    const [loading, setLoading] = useState(false);

    // MENSAJES DE RESPUESTA
    const [mensaje, setMensaje] = useState("");
    const [error, setError]     = useState("");

    // REFERENCIA AL INPUT FILE
    const fileInputRef = useRef(null);

    const subirArchivo = async () => {

        // LIMPIAR MENSAJES ANTES DE SUBIR
        setMensaje("");
        setError("");

        // VALIDAR ARCHIVO
        if (!archivo) {
            setError("Selecciona un archivo");
            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();
            formData.append("archivo", archivo);
            formData.append("keywords", keywords);

            const res = await api.post(
                "/files/upload",
                formData,
                {
                    headers: {
                        Authorization: localStorage.getItem("token")
                    }
                }
            );

            // RESPUESTA ERROR DEL BACKEND
            if (res.data.error) {
                setError(res.data.error);
            } else {

                setMensaje(res.data.mensaje);

                // LIMPIAR MENSAJE DESPUES DE UN TIEMPO
                setTimeout(() => setMensaje(""), 1000);

                // LIMPIAR CAMPOS
                setArchivo(null);
                setKeywords("");

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }

                // ACTUALIZAR LISTA DE ARCHIVOS
                actualizar();
            }

        } catch (error) {
            console.log(error);
            setError("Error al subir archivo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container">

            <h2>Subir Archivo</h2>

            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setArchivo(e.target.files[0])}
            />

            <br /><br />

            {/* MENSAJE DE EXITO */}
            {mensaje && (
                <div className="success-msg">{mensaje}</div>
            )}

            {/* MENSAJE DE ERROR */}
            {error && (
                <div className="error-msg">{error}</div>
            )}

            <br />

            <button onClick={subirArchivo} disabled={loading}>
                {loading ? "Subiendo..." : "Subir"}
            </button>

        </div>
    );
}

export default UploadForm;