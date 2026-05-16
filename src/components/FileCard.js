import "./FileCard.css";

import axios from "axios";

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

        if(!confirmar){
            return;
        }

        await axios.delete(
            `http://localhost:3001/eliminar/${archivo.id}`,
            {
                headers:{
                    Authorization:
                        localStorage.getItem("token")
                }
            }
        );

        actualizar();
    };

    const descargar = () => {

        window.open(
            `http://localhost:3001/download/${archivo.id}`,
            "_blank"
        );
    };

    return (

        <div className="file-card">

            <div className="file-title">
                {archivo.nombre}
            </div>

            <div className="file-keywords">
                {archivo.keywords}
            </div>

            {
                archivo.tipo.includes("image")
                &&
                (
                    <img
                        src={`http://localhost:3001/${archivo.ruta}`}
                        alt=""
                    />
                )
            }

            {
                archivo.tipo.includes("video")
                &&
                (
                    <video controls>

                        <source
                            src={`http://localhost:3001/${archivo.ruta}`}
                        />

                    </video>
                )
            }

            {
                archivo.tipo.includes("audio")
                &&
                (
                    <audio controls>

                        <source
                            src={`http://localhost:3001/${archivo.ruta}`}
                        />

                    </audio>
                )
            }

            {
                archivo.tipo.includes("pdf")
                &&
                (
                    <iframe
                        src={`http://localhost:3001/${archivo.ruta}`}
                        width="100%"
                        height="400"
                        title={archivo.nombre}
                    />
                )
            }

            <br />

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
    );
}

export default FileCard;