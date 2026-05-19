//SE IMPORTA AXIOS
import axios from "axios";

//SE CREA LA CONFIGURACION PRINCIPAL
const api = axios.create({

    //URL DEL SERVIDOR
    baseURL: "http://localhost:3001"
});

//SE EXPORTA LA CONFIGURACION
export default api;