/* rol.jsx */
/* -------------------*/
import React, { useState, useEffect } from "react";
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx";
import { Search } from "lucide-react";
import RolModal from "./rolModal.jsx";
import Swal from "sweetalert2";
import { obtenerCsrfToken, listarRoles, crearRol, eliminarRol, obtenerUsuarioLogeado } from "../../services/roles";

const BASE_IMG_URL = "/assets/img/usuario.jpg"; // Ruta de la imagen predeterminada

// Componente para la barra de búsqueda
function Buscador({ busqueda, setBusqueda }) {
  return (
    <div className="input-group" style={{ maxWidth: "400px" }}>
      <input
        type="text"
        className="form-control"
        placeholder="Buscar roles..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <span className="input-group-text">
        <Search size={18} />
      </span>
    </div>
  );
}

// Componente para las tarjetas de rol
function RolCard({ rol, onFlechaClick, onSelectRol, isSelected }) {
  // Los roles eliminados no deberían llegar aquí si fetchRoles filtra,
  // pero se mantiene la opacidad si por alguna razón un rol eliminado se renderiza.
  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
      <div
        className={`card border-0 shadow-sm rounded-3 overflow-hidden ${rol.estado === "eliminado" ? "bg-light text-danger" : ""}`}
        style={{
          transition: rol.estado === "eliminado" ? "none" : "transform 0.2s ease, box-shadow 0.2s ease",
          opacity: rol.estado === "eliminado" ? 0.5 : 1, 
        }}
        onMouseEnter={(e) => {
          if (rol.estado !== "eliminado") {
            e.currentTarget.style.transform = "scale(1.05)"; // Reducir el zoom
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)"; // Reducir la sombra
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <img
          src={BASE_IMG_URL}
          className="card-img-top"
          alt={`Imagen de ${rol.nombre}`}
          style={{ objectFit: "cover", height: "200px", width: "100%" }}
          loading="lazy"
        />
        <div className="card-body bg-dark text-white text-center">
          <h6 className="card-title mb-2" style={{ fontSize: "1rem" }}>{rol.nombre}</h6>
          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-primary btn-sm d-flex justify-content-center align-items-center"
              onClick={() => onFlechaClick(rol)}
            >
              Ver Información
            </button>
          </div>
          <div className="form-check mt-2">
            <input
              type="checkbox"
              className="form-check-input"
              checked={isSelected}
              onChange={() => onSelectRol(rol.id)}
              id={`select-${rol.id}`}
            />
            <label className="form-check-label" htmlFor={`select-${rol.id}`}></label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal
function Rol() {
  const [busqueda, setBusqueda] = useState("");
  const [roles, setRoles] = useState([]);
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoRol, setNuevoRol] = useState({ nombre: "" }); 
  const [usuarioLogeado, setUsuarioLogeado] = useState(null);

  // Obtener CSRF token al cargar el componente
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        await obtenerCsrfToken();
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error.message);
        Swal.fire({
          icon: "error",
          title: "Error al cargar token CSRF",
          text: "Hubo un error al obtener el token de seguridad. Por favor, inténtelo de nuevo.",
        });
      }
    };
    fetchCsrf();
  }, []);

  // Función para obtener roles desde el backend
  const fetchRoles = async () => {
    try {
      const data = await listarRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error al obtener los roles:", error.message);
      Swal.fire({
        icon: "error",
        title: "Error al cargar roles",
        text: "Hubo un error al obtener los roles. Por favor, inténtelo de nuevo.",
      });
    }
  };

  // Cargar roles al montar el componente
  useEffect(() => {
    fetchRoles();
  }, []);

  // Obtener usuario logeado 
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) throw new Error("No se encontró el ID del usuario.");
        const data = await obtenerUsuarioLogeado(usuarioId);
        setUsuarioLogeado(data);
      } catch (error) {
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

  const rolesFiltrados = roles.filter((rol) =>
    rol.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminarRolesSeleccionados = async () => {
    if (rolesSeleccionados.length === 0) return;
    const confirm = await Swal.fire({
      title: '¿Está seguro de eliminar los roles seleccionados?',
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

    try {
      // Optimistic UI update: Eliminar directamente de la lista
      setRoles((prevRoles) =>
        prevRoles.filter((rol) => !rolesSeleccionados.includes(rol.id))
      );
      for (const id of rolesSeleccionados) {
        await eliminarRol(id);
      }
      
      setRolesSeleccionados([]);
      Swal.fire({
        icon: "success",
        title: "¡Roles eliminados!",
        text: "Los roles seleccionados han sido eliminados correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al eliminar roles:", error.response?.data?.message || error.message);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.response?.data?.message || "Hubo un error al eliminar los roles. Por favor, inténtelo de nuevo.",
      });
      // Revertir la UI si falla la eliminación (recargando para asegurar consistencia)
      fetchRoles();
    }
  };

  const handleSelectRol = (id) => {
    setRolesSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(id)
        ? prevSeleccionados.filter((rolId) => rolId !== id)
        : [...prevSeleccionados, id]
    );
  };

  const handleAbrirModal = (rol) => {
    setRolSeleccionado(rol);
  };

  const handleCerrarModal = () => {
    setRolSeleccionado(null);
    // Ya no es necesario llamar a fetchRoles() aquí si la actualización es optimista
    // y la eliminación filtra los elementos.
  };

  // Función para guardar los cambios de un rol (desde el modal)
  const handleGuardarRol = async (rolEditado) => {
    // Actualiza el estado de la lista de roles en el componente padre de forma optimista
    setRoles(prev => prev.map(r => r.id === rolEditado.id ? rolEditado : r));
    setRolSeleccionado(null); // Cierra el modal después de guardar
    // La lógica de la llamada a la API y el Swal.fire se manejan dentro de RolModal.
  };

  const handleAgregarRol = async () => {
    if (!nuevoRol.nombre.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo incompleto",
        text: "Por favor ingrese un nombre para el rol.",
      });
      return;
    }

    try {
      const response = await crearRol(nuevoRol.nombre);
      if (response && response.rol) {
        setRoles((prevRoles) => [...prevRoles, response.rol]);
        setNuevoRol({ nombre: "" });
        setMostrarFormulario(false);
        Swal.fire({
          icon: "success",
          title: "¡Rol agregado!",
          text: "El rol se ha agregado correctamente.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error("Respuesta inesperada del servidor.");
      }
    } catch (error) {
      console.error("Error al agregar el rol:", error.response?.data?.message || error.message);
      Swal.fire({
        icon: "error",
        title: "Error al agregar",
        text: error.response?.data?.message || "Hubo un error al agregar el rol. Por favor, inténtelo de nuevo.",
      });
    }
  };

  return (
    <div>
      <h1 className="page-header">
        Gestión de Roles <small>administración de roles</small>
      </h1>
      <Panel>
        <PanelHeader>
          <h4 className="panel-title">Gestión de Roles</h4>
        </PanelHeader>
        <PanelBody>
          <div className="row mb-3">
            <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <Buscador busqueda={busqueda} setBusqueda={setBusqueda} />
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-danger"
                  onClick={handleEliminarRolesSeleccionados}
                  disabled={rolesSeleccionados.length === 0}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setMostrarFormulario(true)}
                >
                  <i className="bi bi-plus-circle"></i> Agregar Rol
                </button>
              </div>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
            {rolesFiltrados.map((rol) => (
              <RolCard
                key={rol.id}
                rol={rol}
                onFlechaClick={handleAbrirModal}
                onSelectRol={handleSelectRol}
                isSelected={rolesSeleccionados.includes(rol.id)}
              />
            ))}
          </div>
        </PanelBody>
      </Panel>

      {rolSeleccionado && (
        <RolModal
          rol={rolSeleccionado}
          onClose={handleCerrarModal}
          onSave={handleGuardarRol}
          usuarioLogeado={usuarioLogeado}
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
                  <i className="fas fa-user-shield me-3" style={{ fontSize: "22px", color: "white" }}></i>
                  Agregar Rol
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
                  <label className="form-label" style={{ fontWeight: "600", marginBottom: "8px" }}>Nombre del Rol</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nuevoRol.nombre}
                    onChange={(e) => setNuevoRol({ ...nuevoRol, nombre: e.target.value })}
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
                {/* El campo de ID del usuario ya no se muestra */}
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
                  onClick={handleAgregarRol}
                  disabled={!nuevoRol.nombre.trim()}
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

export default Rol;
