/* SEARCH BAR COMPONENTE */
import "./SearchBar.css";

import {
    useState,
    useEffect,
    useRef,
    useCallback
} from "react";

import api from "../api/api";

function SearchBar({
    busqueda,
    setBusqueda,
    buscar,
    token
}) {

    //SUGERENCIAS DEL BACKEND
    const [sugerencias, setSugerencias] =
        useState([]);

    //MOSTRAR U OCULTAR DROPDOWN
    const [mostrar, setMostrar] =
        useState(false);

    //INDICE PARA NAVEGAR CON TECLADO
    const [indice, setIndice] =
        useState(-1);

    //DEBOUNCE PARA NO HACER MUCHAS PETICIONES
    const debounceRef = useRef(null);

    //REFERENCIA PARA DETECTAR CLICK FUERA
    const wrapperRef = useRef(null);

    //CERRAR DROPDOWN SI SE HACE CLICK FUERA
    useEffect(() => {

        const handler = (e) => {

            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target)
            ) {
                setMostrar(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handler
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handler
            );

    }, []);

    //OBTENER SUGERENCIAS
    const fetchSugerencias = useCallback(
        (texto) => {

            clearTimeout(debounceRef.current);

            //VALIDACION MINIMA
            if (!texto || texto.trim().length < 2) {

                setSugerencias([]);
                setMostrar(false);
                return;
            }

            debounceRef.current = setTimeout(
                async () => {

                    try {

                        const headers =
                            token
                                ? {
                                    Authorization: token
                                }
                                : {};

                        const res =
                            await api.get(
                                "/files/sugerencias",
                                {
                                    params: { q: texto },
                                    headers
                                }
                            );

                        const data =
                            Array.isArray(res.data)
                                ? res.data
                                : [];

                        setSugerencias(data);

                        setMostrar(
                            data.length > 0
                        );

                        setIndice(-1);

                    } catch {

                        setSugerencias([]);
                        setMostrar(false);
                    }

                },
                250
            );
        },
        [token]
    );

    //CUANDO ESCRIBE EL USUARIO
    const handleChange = (e) => {

        const val = e.target.value;

        setBusqueda(val);

        fetchSugerencias(val);
    };

    //TECLADO (ARRIBA, ABAJO, ENTER)
    const handleKeyDown = (e) => {

        if (!mostrar) {

            if (e.key === "Enter")
                buscar();

            return;
        }

        if (e.key === "ArrowDown") {

            e.preventDefault();

            setIndice(i =>
                Math.min(
                    i + 1,
                    sugerencias.length - 1
                )
            );

        } else if (e.key === "ArrowUp") {

            e.preventDefault();

            setIndice(i =>
                Math.max(i - 1, -1)
            );

        } else if (e.key === "Enter") {

            if (indice >= 0) {

                elegir(sugerencias[indice]);

            } else {

                setMostrar(false);

                buscar();
            }

        } else if (e.key === "Escape") {

            setMostrar(false);
        }
    };

    //ELEGIR SUGERENCIA
    const elegir = (texto) => {

        setBusqueda(texto);

        setSugerencias([]);

        setMostrar(false);

        setIndice(-1);

        //EJECUTA BUSQUEDA AUTOMATICA
        setTimeout(() => buscar(), 0);
    };

    //RESALTAR TEXTO COINCIDENTE
    const resaltar = (texto) => {

        const idx =
            texto
                .toLowerCase()
                .indexOf(
                    busqueda.toLowerCase()
                );

        if (idx === -1 || !busqueda)
            return texto;

        return (
            <>
                {texto.slice(0, idx)}
                <strong>
                    {texto.slice(
                        idx,
                        idx + busqueda.length
                    )}
                </strong>
                {texto.slice(
                    idx + busqueda.length
                )}
            </>
        );
    };

    //RENDER
    return (
        <div
            className="search-wrapper"
            ref={wrapperRef}
        >

            <div className="search-container">

                <input
                    type="text"
                    placeholder="Buscar archivos..."
                    value={busqueda}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() =>
                        sugerencias.length > 0 &&
                        setMostrar(true)
                    }
                    autoComplete="off"
                />

                <button
                    onClick={() => {
                        setMostrar(false);
                        buscar();
                    }}
                >
                    Buscar
                </button>

            </div>

            {/*DROPDOWN SUGERENCIAS*/}
            {mostrar &&
                sugerencias.length > 0 && (

                <ul className="sugerencias-lista">

                    {sugerencias.map((s, i) => (

                        <li
                            key={s}
                            className={`sugerencia-item ${
                                i === indice
                                    ? "activo"
                                    : ""
                            }`}
                            onMouseDown={() =>
                                elegir(s)
                            }
                            onMouseEnter={() =>
                                setIndice(i)
                            }
                        >

                            <img
                                src="/icons/buscar.png"
                                alt=""
                                className="sugerencia-icono"
                            />

                            <span>
                                {resaltar(s)}
                            </span>

                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default SearchBar;