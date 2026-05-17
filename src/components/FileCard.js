import "./FileCard.css";

import api from "../api/api";

function FileCard({
    archivo,
    actualizar,
    admin = false
}) {

    const eliminar = async () => {

        const confirmar =
            window.confirm(
                "¿Eliminar archivo?"
            );

        if (!confirmar) return;

        try {

            await api.delete(
                `/files/eliminar/${archivo.id}`,
                {
                    headers: {
                        Authorization:
                            localStorage.getItem("token")
                    }
                }
            );

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

    const fileUrl =
        `http://localhost:3001/${archivo.ruta}`;

    const obtenerIcono = () => {

        if (
            archivo.tipo.includes("word") ||
            archivo.nombre.endsWith(".doc") ||
            archivo.nombre.endsWith(".docx")
        ) {

            return "/icons/doc.png";
        }

        if (
            archivo.tipo.includes("excel") ||
            archivo.nombre.endsWith(".xls") ||
            archivo.nombre.endsWith(".xlsx")
        ) {

            return "/icons/xls.png";
        }

        if (
            archivo.tipo.includes("presentation") ||
            archivo.nombre.endsWith(".ppt") ||
            archivo.nombre.endsWith(".pptx")
        ) {

            return "/icons/ppt.png";
        }

        return "/icons/file.png";
    };

    return (

        <div className="file-card">

            <div className="file-title">
                {archivo.nombre}
            </div>

            <div className="file-keywords">
                {archivo.categoria}
            </div>

            {/* IMAGEN */}
            {
                archivo.tipo.includes("image")
                &&
                (
                    <img
                        src={fileUrl}
                        alt={archivo.nombre}
                    />
                )
            }

            {/* VIDEO */}
            {
                archivo.tipo.includes("video")
                &&
                (
                    <video controls>

                        <source src={fileUrl} />

                    </video>
                )
            }

            {/* AUDIO */}
            {
                archivo.tipo.includes("audio")
                &&
                (
                    <audio controls>

                        <source src={fileUrl} />

                    </audio>
                )
            }

            {/* PDF */}
            {
                archivo.tipo.includes("pdf")
                &&
                (
                    <iframe
                        src={fileUrl}
                        title={archivo.nombre}
                    />
                )
            }

            {/* ARCHIVOS OFFICE */}
            {
                (
                    archivo.nombre.endsWith(".doc") ||
                    archivo.nombre.endsWith(".docx") ||
                    archivo.nombre.endsWith(".xls") ||
                    archivo.nombre.endsWith(".xlsx") ||
                    archivo.nombre.endsWith(".ppt") ||
                    archivo.nombre.endsWith(".pptx")
                )
                &&
                (
                    <img
                        src={obtenerIcono()}
                        alt="icono archivo"
                        className="office-icon"
                    />
                )
            }

            <div className="buttons-container">

                <button
                    className="download-button"
                    onClick={descargar}
                >
                    Descargar
                </button>

                {
                    admin &&
                    (
                        <button
                            className="delete-button"
                            onClick={eliminar}
                        >
                            Eliminar
                        </button>
                    )
                }

            </div>

        </div>
    );
}

export default FileCard;