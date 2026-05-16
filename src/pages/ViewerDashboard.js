import "./ViewerDashboard.css";

import {
    useEffect,
    useState,
    useCallback
} from "react";
import axios from "axios";

import SearchBar from "../components/SearchBar";
import FileCard from "../components/FileCard";


function ViewerDashboard() {

    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);

    const buscar = useCallback(async () => {

        try{

            const res = await axios.get(
                `http://localhost:3001/buscar-publico?q=${busqueda}`
            );

            setResultados(
                Array.isArray(res.data)
                ? res.data
                : []
            );

        }catch(error){

            console.log(error);

            setResultados([]);
        }
    }, [busqueda]);

    useEffect(() => {

        buscar();

    }, []);

    return (

        <div className="viewer-container">

            <h1>
                Buscador Multimedia
            </h1>

            <p>
                Busca imágenes, videos,
                audio y documentos almacenados.
            </p>

            <SearchBar
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                buscar={buscar}
            />

            <div
                style={{
                    display:"grid",
                    gridTemplateColumns:
                        "repeat(auto-fill,minmax(350px,1fr))",
                    gap:"20px",
                    marginTop:"20px"
                }}
            >

                {
                    resultados.map((archivo) => (

                        <FileCard
                            key={archivo.id}
                            archivo={archivo}
                            actualizar={buscar}
                        />

                    ))
                }

            </div>

        </div>
    );
}

export default ViewerDashboard;