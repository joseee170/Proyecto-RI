import "./ViewerDashboard.css";

import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../api/api";

import SearchBar from "../components/SearchBar";
import FileCard from "../components/FileCard";

function ViewerDashboard() {

    const navigate =
        useNavigate();

    const [busqueda, setBusqueda] =
        useState("");

    const [resultados, setResultados] =
        useState([]);

    const buscar =
        async (texto = "") => {

        try {

            const res =
                await api.get(
                    "/files/buscar-publico",
                    {
                        params: {
                            q: texto
                        }
                    }
                );

            setResultados(
                Array.isArray(res.data)
                    ? res.data
                    : []
            );

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

            <div className="viewer-header">

                <div>

                    <h1>
                        Buscador Multimedia
                    </h1>

                    <p>
                        Busca imágenes, videos,
                        audio y documentos almacenados.
                    </p>

                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/")}
                >

                    <img
                        src="/icons/volver.png"
                        alt="volver"
                        className="back-icon"
                    />
                </button>

            </div>

            <SearchBar
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                buscar={() => buscar(busqueda)}
            />

            <div className="viewer-grid">

                {
                    resultados.map((archivo) => (

                        <FileCard
                            key={archivo.id}
                            archivo={archivo}
                        />

                    ))
                }

            </div>

        </div>
    );
}

export default ViewerDashboard;