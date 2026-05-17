import "./ViewerDashboard.css";

import { useEffect, useState } from "react";
import api from "../api/api";

import SearchBar from "../components/SearchBar";
import FileCard from "../components/FileCard";

function ViewerDashboard() {

    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);

    const buscar = async (texto = "") => {

        try {

            const res = await api.get("/files/buscar-publico", {
                params: {
                    q: texto
                }
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

    return (

        <div className="viewer-container">

            <h1>Buscador Multimedia</h1>

            <p>
                Busca imágenes, videos,
                audio y documentos almacenados.
            </p>

            <SearchBar
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                buscar={() => buscar(busqueda)}
            />

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill,minmax(350px,1fr))",
                    gap: "20px",
                    marginTop: "20px"
                }}
            >

                {resultados.map((archivo) => (

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