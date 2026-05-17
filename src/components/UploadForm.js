import "./UploadForm.css";

import { useState } from "react";
import api from "../api/api";

function UploadForm({ actualizar }) {

    const [archivo, setArchivo] = useState(null);
    const [keywords, setKeywords] = useState("");
    const [loading, setLoading] = useState(false);

    const subirArchivo = async () => {

        if (!archivo) {
            alert("Selecciona un archivo");
            return;
        }

        try {

            setLoading(true);

            const formData = new FormData();
            formData.append("archivo", archivo);
            formData.append("keywords", keywords);

            const res = await api.post("/files/upload", formData, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            if (res.data.error) {
                alert(res.data.error);
            } else {
                alert(res.data.mensaje);
                setArchivo(null);
                setKeywords("");
                actualizar();
            }

        } catch (error) {
            console.log(error);
            alert("Error al subir archivo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-container">

            <h2>Subir Archivo</h2>

            <input
                type="file"
                onChange={(e) => setArchivo(e.target.files[0])}
            />

            <br /><br />

            <input
                type="text"
                placeholder="Keywords (opcional)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
            />

            <br /><br />

            <button onClick={subirArchivo} disabled={loading}>
                {loading ? "Subiendo..." : "Subir"}
            </button>

        </div>
    );
}

export default UploadForm;