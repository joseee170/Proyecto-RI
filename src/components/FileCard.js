import "./FileCard.css";
import { useState, useRef } from "react";
import api from "../api/api";

// Extensiones que tienen botón Visualizar
function esDocumento(nombre = "") {
    const n = nombre.toLowerCase();
    return (
        n.endsWith(".pdf")  ||
        n.endsWith(".doc")  || n.endsWith(".docx") ||
        n.endsWith(".xls")  || n.endsWith(".xlsx") ||
        n.endsWith(".ppt")  || n.endsWith(".pptx")
    );
}

function obtenerIcono(nombre = "") {
    const n = nombre.toLowerCase();
    if (n.endsWith(".pdf"))                       return "/icons/pdf.png";
    if (n.endsWith(".doc")  || n.endsWith(".docx")) return "/icons/doc.png";
    if (n.endsWith(".xls")  || n.endsWith(".xlsx")) return "/icons/xls.png";
    if (n.endsWith(".ppt")  || n.endsWith(".pptx")) return "/icons/ppt.png";
    return "/icons/file.png";
}

function FileCard({ archivo, actualizar, admin = false }) {

    const [modalAbierto, setModalAbierto] = useState(false);
    const [preview, setPreview]           = useState(null);
    const [cargando, setCargando]         = useState(false);
    const docRef = useRef(null);
    const [imgExpandida, setImgExpandida] = useState(false);

    const fileUrl = `http://localhost:3001/${archivo.ruta}`;

    // ── Acciones ──────────────────────────────────────
    const descargar = () =>
        window.open(`http://localhost:3001/files/download/${archivo.id}`, "_blank");

    const eliminar = async () => {
        if (!window.confirm("¿Eliminar archivo?")) return;
        try {
            await api.delete(`/files/eliminar/${archivo.id}`, {
                headers: { Authorization: localStorage.getItem("token") }
            });
            actualizar();
        } catch (e) {
            console.log(e);
        }
    };

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

    const cerrarModal = () => {
        setModalAbierto(false);
        setPreview(null);
    };

    // ── Render ────────────────────────────────────────
    return (
        <>
            <div className="file-card">

                {/* Categoría */}
                <div className="file-keywords">{archivo.categoria}</div>

                {/* Título */}
                <div className="file-title">{archivo.nombre}</div>

                {/* ── Previsualización inline ── */}
                {archivo.tipo.includes("image") && (
                    <>
                        <img
                            src={fileUrl}
                            alt={archivo.nombre}
                            onClick={() => setImgExpandida(true)}
                            style={{ cursor: "pointer" }}
                        />

                        {imgExpandida && (
                            <div
                                className="modal-overlay"
                                onClick={() => setImgExpandida(false)}
                            >
                                <div className="img-modal-wrap" onClick={(e) => e.stopPropagation()}>
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

                {archivo.tipo.includes("video") && (
                    <video controls>
                        <source src={fileUrl} />
                    </video>
                )}

                {archivo.tipo.includes("audio") && (
                    <audio controls>
                        <source src={fileUrl} />
                    </audio>
                )}

                {/* Documentos: solo icono, sin iframe inline */}
                {esDocumento(archivo.nombre) && (
                    <div className="doc-icono-wrap">
                        <img
                            src={obtenerIcono(archivo.nombre)}
                            alt="icono"
                            className="doc-icono"
                        />
                    </div>
                )}

                {/* ── Botones ── */}
                <div className="buttons-container">

                    <button className="download-button" onClick={descargar}>
                        Descargar
                    </button>

                    {/* Botón Visualizar — solo para documentos */}
                    {esDocumento(archivo.nombre) && (
                        <button className="visualizar-button" onClick={visualizar}>
                            Visualizar
                        </button>
                    )}

                    {admin && (
                        <button className="delete-button" onClick={eliminar}>
                            Eliminar
                        </button>
                    )}

                </div>
            </div>

            {/* ── Modal ── */}
            {modalAbierto && (
                <div className="modal-overlay" onClick={cerrarModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-header">
                            <span className="modal-titulo">{archivo.nombre}</span>
                            <button className="modal-cerrar" onClick={cerrarModal}>✕</button>
                        </div>

                        <div className="modal-body">

                            {cargando && (
                                <div className="modal-cargando">Cargando previsualización...</div>
                            )}

                            {!cargando && preview?.error && (
                                <div className="modal-error">{preview.error}</div>
                            )}

                            {/* PDF dentro del modal */}
                            {!cargando && preview?.tipo === "pdf" && (
                                <iframe
                                    src={preview.url}
                                    title={archivo.nombre}
                                    className="modal-iframe"
                                />
                            )}

                            {/* Word / Excel convertido a HTML */}
                            {!cargando && preview?.tipo === "html" && (
                                <div
                                    className="modal-html"
                                    dangerouslySetInnerHTML={{ __html: preview.html }}
                                />
                            )}

                            {/* PowerPoint — sin soporte local */}
                            {!cargando && preview?.tipo === "pptx" && (
                                <div className="modal-error">
                                    PowerPoint no tiene previsualización disponible en local.<br />
                                    Usa el botón <strong>Descargar</strong> para abrirlo.
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default FileCard;
