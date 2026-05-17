import "./FileCard.css";

import api from "../api/api";

function FileCard({
    archivo,
    actualizar,
    admin = false
}) {

    const eliminar = async () => {

        const confirmar = window.confirm("¿Eliminar archivo?");

        if (!confirmar) return;

        try {

            await api.delete(`/files/eliminar/${archivo.id}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });

            actualizar();

        } catch (error) {
            console.log(error);
        }
    };

    const descargar = () => {

        window.open(
            `http://localhost:3001/files/download/${archivo.id}`,
            "_blank"
        );
    };

    // URL correcta del archivo
    const fileUrl = `http://localhost:3001/${archivo.ruta}`;

    return (

        <div className="file-card">

            <div className="file-title">
                {archivo.nombre}
            </div>

            <div className="file-keywords">
                {archivo.keywords}
            </div>

            {/* IMAGEN */}
            {archivo.tipo.includes("image") && (
                <img
                    src={fileUrl}
                    alt={archivo.nombre}
                />
            )}

            {/* VIDEO */}
            {archivo.tipo.includes("video") && (
                <video controls>
                    <source src={fileUrl} />
                </video>
            )}

            {/* AUDIO */}
            {archivo.tipo.includes("audio") && (
                <audio controls>
                    <source src={fileUrl} />
                </audio>
            )}

            {/* PDF */}
            {archivo.tipo.includes("pdf") && (
                <iframe
                    src={fileUrl}
                    width="100%"
                    height="400px"
                    title={archivo.nombre}
                />
            )}

            <br />

            <button
                className="download-button"
                onClick={descargar}
            >
                Descargar
            </button>

            {admin && (
                <button
                    className="delete-button"
                    onClick={eliminar}
                >
                    Eliminar
                </button>
            )}

        </div>
    );
}

export default FileCard;