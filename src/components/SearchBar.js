import "./SearchBar.css";

function SearchBar({
    busqueda,
    setBusqueda,
    buscar
}) {

    return (

        <div className="search-container">

            <input
                type="text"
                placeholder="Buscar archivos..."
                value={busqueda}
                onChange={(e) =>
                    setBusqueda(e.target.value)
                }
            />

            <button onClick={buscar}>
                Buscar
            </button>

        </div>
    );
}

export default SearchBar;