import "./SearchBar.css";

function SearchBar({
    busqueda,
    setBusqueda,
    buscar
}) {

    const handleKeyDown = (e) => {

        if (e.key === "Enter") {
            buscar();
        }
    };

    return (

        <div className="search-container">

            <input
                type="text"
                placeholder="Buscar archivos..."
                value={busqueda}
                onChange={(e) =>
                    setBusqueda(e.target.value)
                }
                onKeyDown={handleKeyDown}
            />

            <button onClick={buscar}>
                Buscar
            </button>

        </div>
    );
}

export default SearchBar;