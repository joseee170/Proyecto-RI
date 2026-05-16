import "./UploadForm.css";

import { useState } from "react";
import axios from "axios";

function UploadForm({ actualizar }) {

    const [archivo, setArchivo] = useState(null);
    const [keywords, setKeywords] = useState("");

    const subirArchivo = async () => {

        const formData = new FormData();

        formData.append("archivo", archivo);
        formData.append("keywords", keywords);

        await axios.post(
            "http://localhost:3001/upload",
            formData,
            {
                headers:{
                    Authorization:
                        localStorage.getItem("token")
                }
            }
        );

        alert("Archivo subido");

        actualizar();
    };

    return (

        <div className="upload-container">

            <h2>
                Subir Archivo
            </h2>

            <input
                type="file"
                onChange={(e) =>
                    setArchivo(e.target.files[0])
                }
            />

            <br /><br />

            <input
                type="text"
                placeholder="Keywords"
                onChange={(e) =>
                    setKeywords(e.target.value)
                }
            />

            <br /><br />

            <button onClick={subirArchivo}>
                Subir
            </button>

        </div>
    );
}

export default UploadForm;