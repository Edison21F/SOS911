/* notificaciones.jsx */
/* -------------------*/
import React, { useState, useCallback } from "react"; // Importa React y hooks necesarios.
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx"; // Importa componentes reutilizables.
import { Search, Trash } from "lucide-react"; // Iconos utilizados en la interfaz.
import NotificacionModal from "./notificaciones_modal.jsx"; // Importa el modal para detalles.
import notificacion_ from "../../assets/img/notificacion.jpg"; // Imagen utilizada como fondo para las tarjetas.

/**
 * Limpia el texto para evitar caracteres no deseados o riesgos de inyección.
 * @param {string} text - Texto a limpiar.
 * @returns {string} Texto limpio.
 */
const sanitizeText = (text) => text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s]/g, "").trim();

/**
 * Componente que representa una tarjeta de notificación.*/
function NotificacionCard({ notificacion, onVerInformacionClick, onSelectNotificacion, isSelected }) {
  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
      <div
        className={`card border-0 shadow-sm rounded-3 overflow-hidden ${
          notificacion.eliminado ? "bg-light text-danger" : ""
        }`}
        style={{
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          opacity: notificacion.eliminado ? 0.5 : 1,
        }}
        onMouseEnter={(e) => {
          if (!notificacion.eliminado) {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!notificacion.eliminado) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {/* Imagen de la tarjeta */}
        <img
          src={notificacion.imagen || notificacion_}
          className="card-img-top"
          alt={`Imagen de ${notificacion.presionBotonId}`}
          style={{ objectFit: "cover", height: "200px", width: "100%" }}
          loading="lazy"
        />

        <div className="card-body bg-dark text-white text-center">
          {/* Título de la notificación */}
          <h6 className="card-title mb-2" style={{ fontSize: "calc(1rem + 2px)" }}>
            Alerta de Botón: {notificacion.presionBotonId}
          </h6>

          {/* Botón de información */}
          <button
            className="btn btn-primary btn-sm mb-2"
            onClick={() => onVerInformacionClick(notificacion)}
          >
            Ver Información
          </button>

          {/* Checkbox debajo del botón */}
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={isSelected}
              onChange={() => onSelectNotificacion(notificacion.id)}
              id={`select-${notificacion.id}`}
            />
            <label
              className="form-check-label text-white"
              htmlFor={`select-${notificacion.id}`}
            ></label>
          </div>
        </div>
      </div>
    </div>
  );
}


/**
 * Componente principal para la gestión de notificaciones.
 */
function GestionNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([
    { id: 1, presionBotonId: "PB001", clienteNotificadoId: "C001", notificacionesRecibidas: 5, eliminado: false },
    { id: 2, presionBotonId: "PB002", clienteNotificadoId: "C002", notificacionesRecibidas: 3, eliminado: false },
    { id: 3, presionBotonId: "PB003", clienteNotificadoId: "C003", notificacionesRecibidas: 8, eliminado: false },
    { id: 4, presionBotonId: "PB004", clienteNotificadoId: "C004", notificacionesRecibidas: 1, eliminado: false },
  ]);

  const [busqueda, setBusqueda] = useState(""); // Estado para manejar la barra de búsqueda.
  const [notificacionesSeleccionadas, setNotificacionesSeleccionadas] = useState([]); // IDs seleccionados.
  const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null); // Notificación para el modal.

  // Filtra las notificaciones según la búsqueda.
  const notificacionesFiltradas = notificaciones.filter((notificacion) =>
    sanitizeText(notificacion.presionBotonId.toLowerCase()).includes(sanitizeText(busqueda.toLowerCase()))
  );

  // Ordena las notificaciones: no eliminadas primero, luego las eliminadas.
  const notificacionesOrdenadas = [
    ...notificacionesFiltradas.filter((notificacion) => !notificacion.eliminado),
    ...notificacionesFiltradas.filter((notificacion) => notificacion.eliminado),
  ];

  // Maneja la selección de tarjetas.
  const handleSeleccionarNotificacion = useCallback(
    (id) => {
      setNotificacionesSeleccionadas((prevSeleccionadas) =>
        prevSeleccionadas.includes(id)
          ? prevSeleccionadas.filter((notificacionId) => notificacionId !== id)
          : [...prevSeleccionadas, id]
      );
    },
    [setNotificacionesSeleccionadas]
  );

  // Maneja el borrado lógico de las notificaciones seleccionadas.
  const handleEliminarSeleccionadas = useCallback(() => {
    const notificacionesActualizadas = notificaciones.map((notificacion) =>
      notificacionesSeleccionadas.includes(notificacion.id)
        ? { ...notificacion, eliminado: true }
        : notificacion
    );
    setNotificaciones(notificacionesActualizadas); // Actualiza la lista de notificaciones.
    setNotificacionesSeleccionadas([]); // Limpia la selección.
  }, [notificaciones, notificacionesSeleccionadas]);

  return (
    <div className="container-fluid">
      <h1 className="page-header">
        Gestión de Notificaciones <small>Administración de notificaciones</small>
      </h1>

      <Panel>
        <PanelHeader>
          <h4 className="panel-title">Notificaciones</h4>
        </PanelHeader>
        <PanelBody>
          <div className="row mb-3">
            <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div className="input-group" style={{ maxWidth: "400px" }}>
                <input
                  type="text" // Barra de búsqueda.
                  className="form-control"
                  placeholder="Buscar por ID del botón..."
                  value={busqueda} // Texto actual en la barra de búsqueda.
                  onChange={(e) => setBusqueda(sanitizeText(e.target.value))} // Cambia el estado de búsqueda.
                />
                <span className="input-group-text">
                  <Search size={18} /> {/* Icono de búsqueda. */}
                </span>
              </div>
              <button
                className="btn btn-danger"
                onClick={handleEliminarSeleccionadas} // Maneja el borrado lógico.
                disabled={notificacionesSeleccionadas.length === 0} // Deshabilita si no hay seleccionados.
              >
                <Trash size={18} /> Eliminar
              </button>
            </div>
          </div>

          {/* Renderiza las tarjetas de notificaciones */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {notificacionesOrdenadas.map((notificacion) => (
              <NotificacionCard
                key={notificacion.id} // Clave única para la tarjeta.
                notificacion={notificacion} // Pasa los datos de la notificación.
                onVerInformacionClick={setNotificacionSeleccionada} // Muestra el modal.
                onSelectNotificacion={handleSeleccionarNotificacion} // Cambia estado de selección.
                isSelected={notificacionesSeleccionadas.includes(notificacion.id)} // Determina si está seleccionada.
                isDeleted={notificacion.eliminado} // Determina si está eliminada.
              />
            ))}
          </div>
        </PanelBody>
      </Panel>

      {/* Renderiza el modal si hay una notificación seleccionada */}
      {notificacionSeleccionada && (
        <NotificacionModal
          notificacion={notificacionSeleccionada} // Datos de la notificación seleccionada.
          onClose={() => setNotificacionSeleccionada(null)} // Cierra el modal.
          onDelete={() => {
            handleEliminarSeleccionadas(); // Aplica el borrado lógico.
            setNotificacionSeleccionada(null); // Limpia la selección del modal.
          }}
        />
      )}
    </div>
  );
}

export default GestionNotificaciones;
