// IMPORTA ESTILOS CSS DEL DASHBOARD
import "./ViewerDashboard.css";

// IMPORTA HOOKS DE REACT PARA ESTADO, EFECTOS Y MEMORIZACIÓN
import { useEffect, useState, useMemo } from "react";

// IMPORTA NAVEGACIÓN ENTRE RUTAS
import { useNavigate } from "react-router-dom";

// IMPORTA CONFIGURACIÓN DE API
import api from "../api/api";

// IMPORTA COMPONENTE DE BARRA DE BÚSQUEDA
import SearchBar from "../components/SearchBar";

// IMPORTA COMPONENTE DE TARJETA DE ARCHIVOS
import FileCard from "../components/FileCard";

// DEFINICIÓN DE FILTROS DISPONIBLES EN LA INTERFAZ
const FILTROS = [
    { label: "Todo",      tipo: "todo" },
    { label: "Imágenes",  tipo: "imagen" },
    { label: "Videos",    tipo: "video" },
    { label: "Audios",    tipo: "audio" },
    { label: "Docs",      tipo: "doc" },
];

// MAPEO DE EXTENSIONES SEGÚN TIPO DE ARCHIVO
const EXTENSIONES = {
    imagen: ["jpg","jpeg","png","gif","webp","bmp","svg","tiff","ico","avif","heic"],
    video:  ["mp4","mkv","avi","mov","wmv","flv","webm","m4v","3gp","mpeg","mpg"],
    audio:  ["mp3","wav","ogg","aac","flac","m4a","wma","opus","aiff"],
    doc:    ["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","odt","ods","odp","rtf"],
};

// FUNCIÓN PARA OBTENER LA EXTENSIÓN DE UN ARCHIVO
function getExt(nombre = "") {
    return nombre.split(".").pop().toLowerCase();
}

// FUNCIÓN PARA VALIDAR SI UN ARCHIVO COINCIDE CON EL FILTRO ACTIVO
function matchFiltro(archivo, filtro) {
    if (filtro === "todo") return true;

    // OBTIENE LA EXTENSIÓN DEL ARCHIVO
    const ext = getExt(archivo.nombre || archivo.ruta || "");

    // VERIFICA SI LA EXTENSIÓN ESTÁ DENTRO DEL TIPO SELECCIONADO
    return (EXTENSIONES[filtro] || []).includes(ext);
}

// COMPONENTE PRINCIPAL DEL DASHBOARD VISUALIZADOR
function ViewerDashboard() {

    // HOOK PARA NAVEGACIÓN ENTRE PÁGINAS
    const navigate = useNavigate();

    // ESTADO PARA TEXTO DE BÚSQUEDA
    const [busqueda, setBusqueda] = useState("");

    // ESTADO PARA RESULTADOS DE LA API
    const [resultados, setResultados] = useState([]);

    // ESTADO PARA FILTRO ACTIVO
    const [filtroActivo, setFiltroActivo] = useState("todo");

    // FUNCIÓN ASÍNCRONA PARA BUSCAR ARCHIVOS EN EL SERVIDOR
    const buscar = async (texto = "") => {
        try {
            // PETICIÓN GET A LA API DE BÚSQUEDA PÚBLICA
            const res = await api.get("/files/buscar-publico", {
                params: { q: texto }
            });

            // GUARDA RESULTADOS EN ESTADO
            setResultados(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            // EN CASO DE ERROR LIMPIA RESULTADOS
            console.log(error);
            setResultados([]);
        }
    };

    // EFECTO QUE SE EJECUTA AL MONTAR EL COMPONENTE
    useEffect(() => {
        buscar("");
    }, []);

    // MEMOIZACIÓN DE RESULTADOS FILTRADOS PARA OPTIMIZAR RENDIMIENTO
    const resultadosFiltrados = useMemo(
        () => resultados.filter(a => matchFiltro(a, filtroActivo)),
        [resultados, filtroActivo]
    );

    // RENDER DEL COMPONENTE
    return (
        <div className="viewer-container">

            {/* ENCABEZADO PRINCIPAL */}
            <div className="viewer-header">
                <div>
                    <h1>Buscador Multimedia</h1>
                    <p>Busca imágenes, videos, audio y documentos almacenados.</p>
                </div>

                {/* BOTÓN PARA REGRESAR AL INICIO */}
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src="/icons/volver.png" alt="volver" className="back-icon" />
                </button>
            </div>

            {/* COMPONENTE DE BÚSQUEDA */}
            <SearchBar
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                buscar={() => buscar(busqueda)}
            />

            {/* BOTONES DE FILTRO */}
            <div className="filters-container">
                {FILTROS.map(({ label, tipo }) => (
                    <button
                        key={tipo}
                        className={`filter-btn ${filtroActivo === tipo ? "active" : ""}`}
                        onClick={() => setFiltroActivo(tipo)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* LISTA DE RESULTADOS FILTRADOS */}
            <div className="viewer-grid">
                {resultadosFiltrados.map((archivo) => (
                    <FileCard
                        key={archivo.id}
                        archivo={archivo}
                    />
                ))}
            </div>

        </div>
    );
}

// EXPORTA EL COMPONENTE PARA USO EN LA APLICACIÓN
export default ViewerDashboard;