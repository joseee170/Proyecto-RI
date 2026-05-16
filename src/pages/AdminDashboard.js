import "./AdminDashboard.css";

import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import UploadForm from "../components/UploadForm";
import SearchBar from "../components/SearchBar";
import FileCard from "../components/FileCard";

function AdminDashboard() {

    const [busqueda, setBusqueda] = useState("");
    const [resultados, setResultados] = useState([]);

    const buscar = async () => {

        try{

            const res = await axios.get(
                `http://localhost:3001/buscar?q=${busqueda}`,
                {
                    headers:{
                        Authorization:
                            localStorage.getItem("token")
                    }
                }
            );

            setResultados(
                Array.isArray(res.data)
                ? res.data
                : []
            );

        }catch(error){

            console.log(error);
        }
    };

    useEffect(() => {

        buscar();

    }, []);

    return (

        <div>

            <Navbar />

            <div className="dashboard-container">

                <h1 className="dashboard-title">
                    Panel Administrador
                </h1>

                <UploadForm actualizar={buscar} />

                <hr />

                <SearchBar
                    busqueda={busqueda}
                    setBusqueda={setBusqueda}
                    buscar={buscar}
                />

                <div className="files-grid">

                    {
                        resultados.map((archivo) => (

                            <FileCard
                                key={archivo.id}
                                archivo={archivo}
                                actualizar={buscar}
                                admin={true}
                            />

                        ))
                    }

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;