import "./AdminDashboard.css";

import { useEffect, useState, useMemo } from "react";
import api from "../api/api";

import Navbar from "../components/Navbar";
import UploadForm from "../components/UploadForm";
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

function AdminDashboard() {

    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState("todo");

    const buscar = async () => {
        try {
            const res = await api.get("/files/buscar", {
                params: { q: busqueda },
                headers: { Authorization: localStorage.getItem("token") }
            });
            setResultados(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        buscar();
    }, []);

    const resultadosFiltrados = useMemo(
        () => resultados.filter(a => matchFiltro(a, filtroActivo)),
        [resultados, filtroActivo]
    );

    return (
        <div>
            <Navbar />
            <div className="dashboard-container">

                <h1 className="dashboard-title">Panel Administrador</h1>

                <UploadForm actualizar={buscar} />

                <hr />

                <SearchBar
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    buscar={buscar}
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

                <div className="files-grid">
                    {resultadosFiltrados.map((archivo) => (
                        <FileCard
                            key={archivo.id}
                            archivo={archivo}
                            actualizar={buscar}
                            admin={true}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}

export default AdminDashboard;
