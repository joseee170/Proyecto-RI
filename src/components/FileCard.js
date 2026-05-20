//SE IMPORTAN LOS ESTILOS
import "./FileCard.css";

//SE IMPORTAN LOS HOOKS
import { useState } from "react";

//SE IMPORTA LA API
import api from "../api/api";

//FUNCION PARA SABER SI ES DOCUMENTO
function esDocumento(nombre = "") {

    const n = nombre.toLowerCase();

    return (
        n.endsWith(".pdf")  ||
        n.endsWith(".doc")  ||
        n.endsWith(".docx") ||
        n.endsWith(".xls")  ||
        n.endsWith(".xlsx") ||
        n.endsWith(".ppt")  ||
        n.endsWith(".pptx")
    );
}

//FUNCION PARA OBTENER EL ICONO
function obtenerIcono(nombre = "") {

    const n = nombre.toLowerCase();

    if (n.endsWith(".pdf"))
        return "/icons/pdf.png";

    if (n.endsWith(".doc") || n.endsWith(".docx"))
        return "/icons/doc.png";

    if (n.endsWith(".xls") || n.endsWith(".xlsx"))
        return "/icons/xls.png";

    if (n.endsWith(".ppt") || n.endsWith(".pptx"))
        return "/icons/ppt.png";

    return "/icons/file.png";
}

//COMPONENTE PRINCIPAL
function FileCard({ archivo, actualizar, admin = false }) {

    //ESTADOS DEL COMPONENTE
    const [modalAbierto, setModalAbierto] = useState(false);
    const [preview, setPreview]           = useState(null);
    const [cargando, setCargando]         = useState(false);
    const [imgExpandida, setImgExpandida] = useState(false);

    //URL DEL ARCHIVO
    const fileUrl = `http://localhost:3001/${archivo.ruta}`;

    //FUNCION PARA DESCARGAR
    const descargar = () =>
        window.open(
            `http://localhost:3001/files/download/${archivo.id}`,
            "_blank"
        );

    //FUNCION PARA ELIMINAR
    const eliminar = async () => {

        if (!window.confirm("¿Eliminar archivo?")) return;

        try {
            await api.delete(`/files/eliminar/${archivo.id}`, {
                headers: {
                    Authorization: localStorage.getItem("token")
                }
            });
            actualizar();
        } catch (e) {
            console.log(e);
        }
    };

    //FUNCION PARA VISUALIZAR
    const visualizar = async () => {

        setModalAbierto(true);
        setCargando(true);
        setPreview(null);

        try {
            const res = await api.get(`/files/preview/${archivo.id}`);
            setPreview(res.data);
        } catch {
            setPreview({ error: "No se pudo cargar la previsualización." });
        }

        setCargando(false);
    };

    //FUNCION PARA CERRAR MODAL
    const cerrarModal = () => {
        setModalAbierto(false);
        setPreview(null);
    };

    //RENDER DEL COMPONENTE
    return (
        <>
            <div className="file-card">

                {/*CATEGORIA*/}
                <div className="file-keywords">
                    {archivo.categoria}
                </div>

                {/*NOMBRE*/}
                <div className="file-title">
                    {archivo.nombre}
                </div>

                {/*PREVISUALIZACION DE IMAGEN*/}
                {archivo.tipo.includes("image") && (
                    <>
                        <img
                            src={fileUrl}
                            alt={archivo.nombre}
                            onClick={() => setImgExpandida(true)}
                            style={{ cursor: "pointer" }}
                        />

                        {/*MODAL DE IMAGEN*/}
                        {imgExpandida && (
                            <div
                                className="modal-overlay"
                                onClick={() => setImgExpandida(false)}
                            >
                                <div
                                    className="img-modal-wrap"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <img
                                        src={fileUrl}
                                        alt={archivo.nombre}
                                        className="img-fullscreen"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/*PREVISUALIZACION DE VIDEO*/}
                {archivo.tipo.includes("video") && (
                    <video controls>
                        <source src={fileUrl} />
                    </video>
                )}

                {/*PREVISUALIZACION DE AUDIO*/}
                {archivo.tipo.includes("audio") && (
                    <audio controls>
                        <source src={fileUrl} />
                    </audio>
                )}

                {/*ICONO PARA DOCUMENTOS*/}
                {esDocumento(archivo.nombre) && (
                    <div className="doc-icono-wrap">
                        <img
                            src={obtenerIcono(archivo.nombre)}
                            alt="icono"
                            className="doc-icono"
                        />
                    </div>
                )}

                {/*BOTONES*/}
                <div className="buttons-container">

                    {/*BOTON DESCARGAR*/}
                    <button
                        className="download-button"
                        onClick={descargar}
                    >
                        Descargar
                    </button>

                    {/*BOTON VISUALIZAR — SOLO DOCUMENTOS*/}
                    {esDocumento(archivo.nombre) && (
                        <button
                            className="visualizar-button"
                            onClick={visualizar}
                        >
                            Visualizar
                        </button>
                    )}

                    {/*BOTON ELIMINAR — SOLO ADMIN*/}
                    {admin && (
                        <button
                            className="delete-button"
                            onClick={eliminar}
                        >
                            Eliminar
                        </button>
                    )}

                </div>
            </div>

            {/*MODAL DE DOCUMENTOS*/}
            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/*ENCABEZADO*/}
                        <div className="modal-header">
                            <span className="modal-titulo">
                                {archivo.nombre}
                            </span>
                            <button
                                className="modal-cerrar"
                                onClick={cerrarModal}
                            >
                                ✕
                            </button>
                        </div>

                        {/*CUERPO*/}
                        <div className="modal-body">

                            {/*CARGANDO*/}
                            {cargando && (
                                <div className="modal-cargando">
                                    Cargando previsualización...
                                </div>
                            )}

                            {/*ERROR*/}
                            {!cargando && preview?.error && (
                                <div className="modal-error">
                                    {preview.error}
                                </div>
                            )}

                            {/*PDF*/}
                            {!cargando && preview?.tipo === "pdf" && (
                                <iframe
                                    src={preview.url}
                                    title={archivo.nombre}
                                    className="modal-iframe"
                                />
                            )}

                            {/*WORD Y EXCEL Y POWERPOINT*/}
                            {!cargando && preview?.tipo === "html" && (
                                <div
                                    className="modal-html"
                                    dangerouslySetInnerHTML={{ __html: preview.html }}
                                />
                            )}

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

//SE EXPORTA EL COMPONENTE
export default FileCard;
