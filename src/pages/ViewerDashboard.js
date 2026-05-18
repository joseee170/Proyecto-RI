import "./ViewerDashboard.css";

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

import SearchBar from "../components/SearchBar";
import FileCard from "../components/FileCard";

const FILTROS = [
    { label: "Todo",      tipo: "todo" },
    { label: "Imágenes",  tipo: "imagen" },
    { label: "Videos",    tipo: "video" },
    { label: "Audios",    tipo: "audio" },
    { label: "Docs",      tipo: "doc" },
];

const EXTENSIONES = {
    imagen: ["jpg","jpeg","png","gif","webp","bmp","svg","tiff","ico","avif","heic"],
    video:  ["mp4","mkv","avi","mov","wmv","flv","webm","m4v","3gp","mpeg","mpg"],
    audio:  ["mp3","wav","ogg","aac","flac","m4a","wma","opus","aiff"],
    doc:    ["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","odt","ods","odp","rtf"],
};

function getExt(nombre = "") {
    return nombre.split(".").pop().toLowerCase();
}

function matchFiltro(archivo, filtro) {
    if (filtro === "todo") return true;
    const ext = getExt(archivo.nombre || archivo.ruta || "");
    return (EXTENSIONES[filtro] || []).includes(ext);
}

function ViewerDashboard() {

    const navigate = useNavigate();
    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState("todo");

    const buscar = async (texto = "") => {
        try {
            const res = await api.get("/files/buscar-publico", {
                params: { q: texto }
            });
            setResultados(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.log(error);
            setResultados([]);
        }
    };

    useEffect(() => {
        buscar("");
    }, []);

    const resultadosFiltrados = useMemo(
        () => resultados.filter(a => matchFiltro(a, filtroActivo)),
        [resultados, filtroActivo]
    );

    return (
        <div className="viewer-container">

            <div className="viewer-header">
                <div>
                    <h1>Buscador Multimedia</h1>
                    <p>Busca imágenes, videos, audio y documentos almacenados.</p>
                </div>
                <button className="back-button" onClick={() => navigate("/")}>
                    <img src="/icons/volver.png" alt="volver" className="back-icon" />
                </button>
            </div>

            <SearchBar
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                buscar={() => buscar(busqueda)}
            />

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

export default ViewerDashboard;
