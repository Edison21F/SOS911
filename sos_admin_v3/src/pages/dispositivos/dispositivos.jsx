/* dispositivos.jsx */
/* -------------------*/
import React, { useState, useEffect, useRef } from "react";
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx";
import { Search } from "lucide-react";
import DispositivosModal from "./dispositivos_modal.jsx";
import Celular from "../../assets/img/celular.jpg";
import Swal from "sweetalert2"; 

// Importar las funciones de la API
import {
  obtenerCsrfToken,
  obtenerTodosLosDispositivos,
  eliminarDispositivo
  // crearDispositivo, // No se necesita si se elimina la funcionalidad de agregar
  // actualizarDispositivo // No se necesita si se elimina la funcionalidad de editar a través del modal
} from '../../services/dispositivos'; 

// Componente para la barra de búsqueda
function Buscador({ busqueda, setBusqueda }) {
  return (
    <div className="input-group" style={{ maxWidth: "400px" }}>
      <input
        type="text"
        className="form-control"
        placeholder="Buscar por ID cliente, dispositivo o tipo..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <span className="input-group-text">
        <Search size={18} />
      </span>
    </div>
  );
}

// Componente para mostrar la tarjeta de información de cada dispositivo
function DispositivoCard({ dispositivo, onFlechaClick, seleccionado, onSelect, eliminado }) {
  return (
    <div className="col">
      <div
        className={`card border-0 shadow-sm rounded-3 overflow-hidden ${eliminado ? "opacity-50" : ""}`}
        style={{
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          cursor: eliminado ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!eliminado) {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (!eliminado) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        <img
          src={Celular}
          className="card-img-top"
          alt={`Imagen de ${dispositivo.nombre}`}
          style={{ objectFit: "cover", height: "200px" }}
          loading="lazy"
        />
        <div className="card-body bg-dark text-white text-center" style={{ padding: "0.5rem 0.25rem" }}>
          <h6 className="card-title mb-1 d-flex align-items-center justify-content-center gap-2" style={{ fontWeight: 700, fontSize: "1.08rem" }}>
            <i className="fas fa-mobile-alt text-primary"></i> {dispositivo.nombre}
          </h6>
          <div className="mb-1 d-flex align-items-center justify-content-center gap-2">
            <i className="fas fa-microchip text-secondary"></i>
            <span style={{ fontSize: ".98rem", fontWeight: 600 }}>{dispositivo.tipoDispositivo}</span>
          </div>
          <div className="mb-1 d-flex align-items-center justify-content-center gap-2">
            <i className="fas fa-user text-info"></i>
            <span style={{ fontSize: ".85rem", fontWeight: 500 }}>ID: {dispositivo.clienteId}</span>
          </div>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => onFlechaClick(dispositivo)}
              disabled={eliminado}
            >
              Ver Información
            </button>
          </div>
          
          <div className="form-check mt-2 d-flex justify-content-center">
            <input
              type="checkbox"
              checked={seleccionado}
              onChange={() => onSelect(dispositivo.id)}
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                transform: "scale(1.2)",
              }}
              disabled={eliminado}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function GestionDispositivos() {
  const [busqueda, setBusqueda] = useState("");
  const [dispositivos, setDispositivos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(null);
  const [dispositivosSeleccionados, setDispositivosSeleccionados] = useState([]);
  // const [mostrarFormulario, setMostrarFormulario] = useState(false); // Eliminado
  // const [nuevoDispositivo, setNuevoDispositivo] = useState({ dispositivo: "", tipo: "", clienteId: "", tokenDispositivo: "" }); // Eliminado
  // const [dispositivoEditando, setDispositivoEditando] = useState(null); // Eliminado
  const csrfFetched = useRef(false); // Para asegurar que el token CSRF se obtenga una sola vez

  // Función para cargar los dispositivos
  const cargarDispositivos = async () => {
    try {
      setIsLoading(true);
      const data = await obtenerTodosLosDispositivos();
      // Reordenar los dispositivos para que los eliminados vayan al final
      const dispositivosOrdenados = data.sort((a, b) =>
        a.eliminado === b.eliminado ? 0 : a.eliminado ? 1 : -1
      );
      setDispositivos(dispositivosOrdenados);
    } catch (error) {
      console.error('Error al cargar dispositivos:', error);
      Swal.fire({
        icon: "error",
        title: "Error de carga",
        text: "No se pudieron cargar los dispositivos. Intente de nuevo más tarde.",
      });
      // Mantener datos por defecto en caso de error o si no hay datos
      setDispositivos([
        { id: 1, clienteId: "505", clienteNombre: "Cliente Demo", tipoDispositivo: "Android", nombre: "Samsung Galaxy Tab S7", tokenDispositivo: "token_demo", eliminado: false },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener token CSRF y cargar dispositivos al montar el componente
  useEffect(() => {
    const init = async () => {
      if (!csrfFetched.current) {
        try {
          await obtenerCsrfToken();
          csrfFetched.current = true;
        } catch (error) {
          console.error('Error al obtener el token CSRF:', error);
          Swal.fire({
            icon: "error",
            title: "Error de seguridad",
            text: "No se pudo obtener el token de seguridad. Recargue la página.",
          });
          setIsLoading(false);
          return;
        }
      }
      cargarDispositivos();
    };
    init();
  }, []);

  const dispositivosFiltrados = dispositivos.filter((dispositivo) =>
    dispositivo.clienteId.toString().toLowerCase().includes(busqueda.toLowerCase()) ||
    dispositivo.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    dispositivo.tipoDispositivo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminarDispositivo = async (dispositivoIds = null, mostrarConfirmacion = true) => {
    const idsAEliminar = dispositivoIds || dispositivosSeleccionados;
    const cantidad = Array.isArray(idsAEliminar) ? idsAEliminar.length : 1;
    const idsArray = Array.isArray(idsAEliminar) ? idsAEliminar : [idsAEliminar];

    if (idsArray.length === 0) return;

    const idsValidos = idsArray.filter(id => id && !isNaN(id) && typeof id !== 'object');
    if (idsValidos.length === 0) {
      console.error('No se encontraron IDs válidos para eliminar:', idsArray);
      return;
    }

    if (mostrarConfirmacion) {
      const result = await Swal.fire({
        title: `¿Desea eliminar ${cantidad > 1 ? `estos ${cantidad} dispositivos` : 'este dispositivo'}?`,
        text: "Esta acción no se puede deshacer",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    try {
      for (const dispositivoId of idsValidos) {
        await eliminarDispositivo(dispositivoId);
      }

      // Volver a cargar los dispositivos después de la eliminación exitosa
      await cargarDispositivos();
      setDispositivosSeleccionados([]); // Limpiar la selección

      if (mostrarConfirmacion) {
        Swal.fire({
          icon: "success",
          title: "Eliminados",
          text: `${cantidad} dispositivo(s) eliminado(s) correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error al eliminar dispositivos:', error);
      if (mostrarConfirmacion) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Hubo un error al eliminar los dispositivos: ${error.message || error.response?.data?.error || 'Error desconocido'}`,
        });
      }
      throw error; // Re-lanzar el error para que el modal lo maneje si es el caso
    }
  };

  const handleSeleccionarDispositivo = (id) => {
    setDispositivosSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(id)
        ? prevSeleccionados.filter((dispositivoId) => dispositivoId !== id)
        : [...prevSeleccionados, id]
    );
  };

  return (
    <div className="container-fluid">
      <h1 className="page-header">
        Dispositivos <small>Información útil</small>
      </h1>
      <Panel>
        <PanelHeader>
          <h4 className="panel-title">Dispositivos</h4>
        </PanelHeader>
        <PanelBody>
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2 text-muted">Cargando dispositivos...</p>
            </div>
          ) : (
            <>
              <div className="row mb-3">
                <div className="col-12 col-lg-6 mb-2">
                  <Buscador busqueda={busqueda} setBusqueda={setBusqueda} />
                </div>
                <div className="col-12 col-lg-6 d-flex flex-wrap justify-content-lg-end gap-2">
                  {/* Botón "Agregar Dispositivo" eliminado */}
                  <button
                    className="btn btn-danger d-flex align-items-center gap-1"
                    onClick={() => handleEliminarDispositivo()}
                    disabled={dispositivosSeleccionados.length === 0}
                  >
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </div>
              </div>

              {dispositivosFiltrados.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-mobile-alt fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No se encontraron dispositivos</h5>
                  <p className="text-muted">
                    {busqueda ? "Intenta con otros términos de búsqueda" : "No hay dispositivos registrados"}
                  </p>
                </div>
              ) : (
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                  {dispositivosFiltrados.map((dispositivo) => (
                    <DispositivoCard
                      key={dispositivo.id}
                      dispositivo={dispositivo}
                      onFlechaClick={setDispositivoSeleccionado}
                      seleccionado={dispositivosSeleccionados.includes(dispositivo.id)}
                      onSelect={handleSeleccionarDispositivo}
                      eliminado={dispositivo.eliminado}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </PanelBody>
      </Panel>

      {dispositivoSeleccionado && (
        <DispositivosModal
          dispositivo={dispositivoSeleccionado}
          onClose={() => setDispositivoSeleccionado(null)}
          onDelete={async (id) => {
            // Cuando se elimina desde el modal, se recargan los datos
            await cargarDispositivos();
            setDispositivosSeleccionados([]);
          }}
        />
      )}

      {/* Modal de agregar/editar dispositivo eliminado */}
    </div>
  );
}

export default GestionDispositivos;
