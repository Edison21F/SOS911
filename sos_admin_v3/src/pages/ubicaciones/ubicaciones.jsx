/* ubicaciones.js */
/* -------------------*/
// Importación React, hooks y librerías necesarias
import React, { useState } from "react"; // Importa React y el hook useState para manejar el estado.
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx"; // Importa componentes personalizados Panel, PanelHeader y PanelBody.
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"; // Importa componentes de react-leaflet para mostrar mapas interactivos.
import "leaflet/dist/leaflet.css"; // Importa los estilos de Leaflet para el mapa.
import L from "leaflet"; // Importa Leaflet para configurar mapas y marcadores.
import { Search } from "lucide-react"; // Importa el ícono Search de Lucide React.

// Configuración del ícono personalizado para los marcadores
const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png", // URL del ícono.
  iconSize: [25, 41], // Tamaño del ícono.
  iconAnchor: [12, 41], // Punto de anclaje del ícono.
  popupAnchor: [1, -34], // Punto donde aparece el popup.
});

function Ubicaciones() {
  const [ubicaciones] = useState([
    // Define el estado inicial con una lista de ubicaciones.
    { id: 1, cliente_id: 6, latitud: -0.137235, longitud: -78.478535, direccion: "San Juan de Calderón", marcaDeTiempo: "2024-06-26 21:00:00" },
    { id: 2, cliente_id: 1, latitud: -0.202091, longitud: -78.490774, direccion: "La Mariscal", marcaDeTiempo: "2024-06-26 22:00:00" },
    { id: 3, cliente_id: 2, latitud: -0.220164, longitud: -78.512351, direccion: "Quito Centro", marcaDeTiempo: "2024-06-27 12:00:00" },
    { id: 4, cliente_id: 3, latitud: -0.225876, longitud: -78.517084, direccion: "El Ejido", marcaDeTiempo: "2024-06-26 20:00:00" },
    { id: 5, cliente_id: 7, latitud: -0.180653, longitud: -78.467838, direccion: "Parque La Carolina", marcaDeTiempo: "2024-06-27 10:30:00" },
    { id: 6, cliente_id: 4, latitud: -0.233456, longitud: -78.507843, direccion: "Chimbacalle", marcaDeTiempo: "2024-06-27 11:00:00" },
    { id: 7, cliente_id: 5, latitud: -0.170758, longitud: -78.471445, direccion: "Parque Bicentenario", marcaDeTiempo: "2024-06-27 12:00:00" },
    { id: 8, cliente_id: 8, latitud: -0.175372, longitud: -78.485644, direccion: "Cumbayá", marcaDeTiempo: "2024-06-27 12:30:00" },
  ]);
  const [busqueda, setBusqueda] = useState(""); // Estado para almacenar el texto de búsqueda.
  const [paginaActual, setPaginaActual] = useState(1); // Estado para controlar la página actual.
  const elementosPorPagina = 5; // Define cuántos elementos mostrar por página.

  // Filtra las ubicaciones según el ID del cliente ingresado en la búsqueda.
  const ubicacionesFiltradas = ubicaciones.filter((ubicacion) =>
    ubicacion.cliente_id.toString().includes(busqueda)
  );

  const totalPaginas = Math.ceil(ubicacionesFiltradas.length / elementosPorPagina); // Calcula el total de páginas basado en el número de resultados.
  const inicio = (paginaActual - 1) * elementosPorPagina; // Calcula el índice inicial de la página actual.
  const ubicacionesPaginadas = ubicacionesFiltradas.slice(inicio, inicio + elementosPorPagina); // Obtiene solo las ubicaciones de la página actual.

  const cambiarPagina = (pagina) => {
    // Cambia la página actual si está dentro de los límites.
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  return (
    <div>
      {/* Título de la página */}
      <h1 className="page-header">
        Gestión de Ubicaciones <small>administración de ubicaciones</small>
      </h1>

      {/* Contenedores principales */}
      <div className="row">
        {/* Tabla de ubicaciones */}
        <div className="col-12">
          <Panel>
            <PanelHeader>
              <h4 className="panel-title">Lista de Ubicaciones</h4>
            </PanelHeader>
            <PanelBody>
              {/* Input de búsqueda */}
              <div className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por ID de cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)} // Actualiza el estado de búsqueda.
                  />
                  <span className="input-group-text">
                    <Search size={18} /> {/* Ícono de búsqueda */}
                  </span>
                </div>
              </div>
              {/* Tabla de datos */}
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre Cliente</th>
                      <th>Dirección</th>
                      <th>Marca de Tiempo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ubicacionesPaginadas.length > 0 ? (
                      ubicacionesPaginadas.map((ubicacion) => (
                        <tr key={ubicacion.id}>
                          <td>{ubicacion.id}</td>
                          <td>{ubicacion.cliente_id}</td>
                          <td>{ubicacion.direccion}</td>
                          <td>{ubicacion.marcaDeTiempo}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No se encontraron resultados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {/* Paginación */}
              <nav aria-label="Page navigation" className="mt-4">
                <ul className="pagination justify-content-end">
                  <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => cambiarPagina(paginaActual - 1)}>
                      Anterior
                    </button>
                  </li>
                  {[...Array(totalPaginas)].map((_, index) => (
                    <li
                      key={index}
                      className={`page-item ${paginaActual === index + 1 ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => cambiarPagina(index + 1)}>
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => cambiarPagina(paginaActual + 1)}>
                      Siguiente
                    </button>
                  </li>
                </ul>
              </nav>
            </PanelBody>
          </Panel>
        </div>

        {/* Mapa interactivo */}
        <div className="col-12 mt-4">
          <Panel>
            <PanelHeader>
              <h4 className="panel-title">Mapa de Ubicaciones</h4>
            </PanelHeader>
            <PanelBody>
              <div style={{ height: "450px" }}>
                <MapContainer
                  center={[-0.2252195, -78.5248]} // Centro inicial del mapa.
                  zoom={14} // Nivel de zoom.
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" // Capa base del mapa.
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                  />
                  {ubicacionesFiltradas.map((ubicacion) => (
                    <Marker
                      key={ubicacion.id}
                      position={[ubicacion.latitud, ubicacion.longitud]} // Posición del marcador.
                      icon={customIcon} // Ícono personalizado.
                    >
                      <Popup>
                        <strong>Nombre Cliente:</strong> {ubicacion.cliente_id}
                        <br />
                        <strong>Dirección:</strong> {ubicacion.direccion}
                        <br />
                        <strong>Fecha:</strong> {ubicacion.marcaDeTiempo}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </PanelBody>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default Ubicaciones; // Exporta el componente para que pueda ser usado en otras partes de la aplicación.
