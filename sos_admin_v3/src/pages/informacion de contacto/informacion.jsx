/* informacion_contacto_usuario.jsx */
/* -------------------*/
import React, { useState, useEffect } from "react";
import { listarUsuariosNumeros, crearUsuarioNumero, eliminarUsuarioNumero } from '../../services/usuarios_numeros';
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx";
import { Search } from "lucide-react";
import InformacionModal from "./informacion_modal.jsx";
import Swal from "sweetalert2"; // Importa SweetAlert
import "../../assets/scss/informacion.scss";

// Componente para la barra de búsqueda
function Buscador({ busqueda, setBusqueda }) {
  return (
    <div className="input-group" style={{ maxWidth: "400px" }}>
      <input
        type="text"
        className="form-control"
        placeholder="Buscar usuario..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <span className="input-group-text">
        <Search size={18} />
      </span>
    </div>
  );
}

// Componente para mostrar la tarjeta de información de cada usuario
function InformacionCard({ informacion, onFlechaClick, seleccionado, onSelect, eliminado }) {
  return (
    <div className="col">
      <div
        className={`card border-0 shadow-sm rounded-3 overflow-hidden ${eliminado ? "opacity-50" : ""}`}
        style={{
          transition: "transform 0.2s ease",
          cursor: eliminado ? "not-allowed" : "pointer",
        }}
        onMouseEnter={(e) => {
          if (!eliminado) {
            e.currentTarget.style.transform = "scale(1.05)"; // Efecto de zoom reducido
          }
        }}
        onMouseLeave={(e) => {
          if (!eliminado) {
            e.currentTarget.style.transform = "scale(1)";
          }
        }}
      >
        <img
          src="/assets/img/Pinteres.jpeg" // Ruta absoluta, asumiendo que esta imagen está en tu carpeta public/assets/img
          alt={`Imagen de ${informacion.nombre}`}
          className="card-img-top"
        />
        <div className="card-body bg-dark text-white text-center">
          <h6 className="card-title mb-1">{informacion.nombre}</h6>
          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onFlechaClick(informacion)}
              disabled={eliminado}
            >
              Ver Información
            </button>
          </div>
          <div className="form-check mt-2">
            <input
              type="checkbox"
              checked={seleccionado}
              onChange={() => onSelect(informacion.id)}
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

// Componente principal
function InformacionContactosUsuarios() {
  const [busqueda, setBusqueda] = useState("");
  const [informaciones, setInformaciones] = useState([]);
  const [informacionSeleccionada, setInformacionSeleccionada] = useState(null);
  const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: "", numero: "" });
  const [usuarioLogeado, setUsuarioLogeado] = useState(null);

  // Obtener usuario logeado (igual que en perfil.jsx)
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) {
          throw new Error("No se encontró el ID del usuario en localStorage. Inicia sesión de nuevo.");
        }
        // Usa el servicio usuarios_numeros.js para obtener el usuario logeado
        // Si tienes un servicio usuarios.js, deberías importar y usar una función getUsuarioDetalle(usuarioId)
        // Por ahora, hacemos fetch directo con fetch (sin axios)
        const csrfToken = localStorage.getItem("csrfToken");
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backsos911-production.up.railway.app'}/usuarios/detalle/${usuarioId}`,
          {
            credentials: 'include',
            headers: {
              'X-CSRF-Token': csrfToken
            }
          });
        const data = await response.json();
        if (data && data.usuario) {
          setUsuarioLogeado(data.usuario);
        } else {
          setUsuarioLogeado(data);
        }
      } catch (error) {
        console.error("Error al obtener el usuario logeado:", error.message);
        setUsuarioLogeado(null);
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: "No se pudo cargar la información del usuario. Por favor, inicia sesión de nuevo.",
        });
      }
    };
    fetchUsuario();
  }, []);

  // Obtener token CSRF al cargar el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // Usa fetch para obtener el token CSRF
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://backsos911-production.up.railway.app'}/csrf-token`, {
          credentials: 'include'
        });
        const data = await response.json();
        const token = data.data?.csrfToken || data.csrfToken;
        if (token) {
          localStorage.setItem("csrfToken", token);
        } else {
          throw new Error("CSRF token not found in response.");
        }
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error.message);
        Swal.fire({
          icon: "error",
          title: "Error al cargar token CSRF",
          text: "Hubo un error al obtener el token de seguridad. Por favor, inténtelo de nuevo.",
        });
      }
    };
    fetchCsrfToken();
  }, []);

  // Función para obtener la lista de informaciones (números de usuario)
  const fetchInformaciones = async () => {
    try {
      const data = await listarUsuariosNumeros();
      const datos = data.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        numero: item.numero,
        eliminado: item.estado === "eliminado",
      }));
      setInformaciones(datos);
    } catch (error) {
      console.error("Error al obtener la información:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error al cargar datos",
        text: "Hubo un error al obtener la información. Por favor, inténtelo de nuevo.",
      });
    }
  };

  // Cargar informaciones al montar el componente
  useEffect(() => {
    fetchInformaciones();
  }, []);

  // Manejar la eliminación de informaciones seleccionadas
  const handleEliminarInformacion = async () => {
    if (usuariosSeleccionados.length === 0) return;

    const confirm = await Swal.fire({
      title: '¿Está seguro de eliminar los números seleccionados?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (!confirm.isConfirmed) return;

    const csrfToken = localStorage.getItem("csrfToken");
    if (!csrfToken) {
        Swal.fire({
            icon: "error",
            title: "Error de seguridad",
            text: "Token CSRF no disponible. Recargue la página.",
        });
        return;
    }

    try {
      // Optimistic UI update
      setInformaciones((prevInformaciones) =>
        prevInformaciones.map((info) =>
          usuariosSeleccionados.includes(info.id)
            ? { ...info, eliminado: true } // Marcar como eliminado visualmente
            : info
        )
      );

      for (const id of usuariosSeleccionados) {
        await eliminarUsuarioNumero(id);
      }
      setUsuariosSeleccionados([]);
      Swal.fire({
        icon: "success",
        title: "¡Eliminación exitosa!",
        text: "Los números seleccionados han sido eliminados correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });
      // Volver a cargar los datos para asegurar la consistencia si hubo algún error
      fetchInformaciones(); 
    } catch (error) {
      console.error("Error al eliminar la información:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: "Hubo un error al eliminar la información. Por favor, inténtelo de nuevo.",
      });
      // Revertir UI si falla la eliminación
      fetchInformaciones(); 
    }
  };

  // Manejar el guardado de un nuevo número de usuario
  const handleGuardarNuevoUsuario = async () => {
    const csrfToken = localStorage.getItem("csrfToken");
    if (!csrfToken) {
        Swal.fire({
            icon: "error",
            title: "Error de seguridad",
            text: "Token CSRF no disponible. Recargue la página.",
        });
        return;
    }

    if (!nuevoUsuario.nombre || !nuevoUsuario.numero) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor complete todos los campos antes de guardar.",
      });
      return;
    }
    if (!usuarioLogeado || !(usuarioLogeado.id || usuarioLogeado._id)) {
      Swal.fire({
        icon: "error",
        title: "Usuario no identificado",
        text: "No se pudo identificar el usuario logeado. Intente recargar la página.",
      });
      return;
    }
    try {
      const response = await crearUsuarioNumero({
        nombre: nuevoUsuario.nombre,
        numero: nuevoUsuario.numero,
        usuarioId: usuarioLogeado.id || usuarioLogeado._id,
      });
      if (response && response.usuarioNumero) {
        setInformaciones((prevInformaciones) => [
          {
            id: response.usuarioNumero.id,
            nombre: response.usuarioNumero.nombre,
            numero: response.usuarioNumero.numero,
            eliminado: false,
          },
          ...prevInformaciones,
        ]);
        setNuevoUsuario({ nombre: "", numero: "" });
        setMostrarFormulario(false);
        Swal.fire({
          icon: "success",
          title: "¡Número agregado!",
          text: "El número ha sido agregado correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Respuesta inesperada del servidor.");
      }
    } catch (error) {
      console.error("Error al guardar el nuevo usuario:", error.response?.data?.message || error.message);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.response?.data?.message || "Hubo un error al guardar el usuario. Por favor, inténtelo de nuevo.",
      });
    }
  };

  const usuariosFiltrados = informaciones.filter((info) =>
    info.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h1 className="page-header">
        Información de Contacto Usuario <small>administración</small>
      </h1>

      <Panel>
        <PanelHeader>
          <h4 className="panel-title">Información de Contacto del Usuario</h4>
        </PanelHeader>
        <PanelBody>
          <div className="row mb-3">
            <div className="col-12 col-lg-6 mb-2">
              <Buscador busqueda={busqueda} setBusqueda={setBusqueda} />
            </div>
            <div className="col-12 col-lg-6 d-flex flex-wrap justify-content-lg-end gap-2">
              <button
                className="btn btn-danger"
                onClick={handleEliminarInformacion}
                disabled={usuariosSeleccionados.length === 0}
              >
                <i className="bi bi-trash"></i> Eliminar
              </button>
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setMostrarFormulario(true)}
              >
                <i className="bi bi-plus-circle"></i>Agregar
              </button>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {usuariosFiltrados.map((informacion) => (
              <InformacionCard
                key={informacion.id}
                informacion={informacion}
                onFlechaClick={setInformacionSeleccionada}
                seleccionado={usuariosSeleccionados.includes(informacion.id)}
                onSelect={(id) =>
                  setUsuariosSeleccionados((prevSeleccionados) =>
                    prevSeleccionados.includes(id)
                      ? prevSeleccionados.filter((usuarioId) => usuarioId !== id)
                      : [...prevSeleccionados, id]
                  )
                }
                eliminado={informacion.eliminado}
              />
            ))}
          </div>
        </PanelBody>
      </Panel>

      {informacionSeleccionada && (
        <InformacionModal
          informacion={informacionSeleccionada}
          onClose={() => setInformacionSeleccionada(null)}
          setInformaciones={setInformaciones} // Pasar setInformaciones al modal
        />
      )}

      {mostrarFormulario && (
        <div
          className="modal"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)" }}>
              <div className="modal-header" style={{ backgroundColor: "#0891b2", color: "white", padding: "30px", borderBottom: "none" }}>
                <h5 className="modal-title d-flex align-items-center" style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                  <i className="fas fa-user-circle me-3" style={{ fontSize: "22px", color: "white" }}></i>
                  Agregar Usuario
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setMostrarFormulario(false)}
                  style={{ fontSize: "18px" }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: "30px" }}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: "600", marginBottom: "8px" }}>Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                    style={{ 
                      borderRadius: "10px",
                      border: "2px solid #e0e0e0",
                      padding: "12px 16px",
                      fontSize: "14px",
                      transition: "border-color 0.3s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#0891b2"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label" style={{ fontWeight: "600", marginBottom: "8px" }}>Número</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nuevoUsuario.numero}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, numero: e.target.value })}
                    style={{ 
                      borderRadius: "10px",
                      border: "2px solid #e0e0e0",
                      padding: "12px 16px",
                      fontSize: "14px",
                      transition: "border-color 0.3s ease"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#0891b2"}
                    onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
                {/* El campo de Usuario ID ya no se muestra, se obtiene del estado usuarioLogeado */}
              </div>
              <div className="modal-footer" style={{ padding: "30px", borderTop: "1px solid #e0e0e0", backgroundColor: "#f8f9fa" }}>
                <button
                  type="button"
                  className="btn btn-secondary d-flex align-items-center"
                  onClick={() => setMostrarFormulario(false)}
                  style={{ 
                    fontSize: "1.08rem",
                    padding: "10px 32px",
                    borderRadius: "14px",
                    fontWeight: "500",
                    transition: "all 0.3s ease"
                  }}
                >
                  <i className="fas fa-times me-2"></i> Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary d-flex align-items-center"
                  onClick={handleGuardarNuevoUsuario}
                  disabled={!usuarioLogeado || !usuarioLogeado.id} 
                  style={{
                    fontSize: "1.08rem",
                    padding: "10px 32px",
                    borderRadius: "14px",
                    fontWeight: "500",
                    backgroundColor: "#0891b2",
                    borderColor: "#0891b2",
                    transition: "all 0.3s ease"
                  }}
                >
                  <i className="fas fa-save me-2"></i> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InformacionContactosUsuarios;
