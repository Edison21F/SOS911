/* contactos_emergencia.jsx */
/* -------------------*/
import React, { useState, useEffect } from "react";
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx";
import { Search, PhoneCall } from "lucide-react";
import EmergenciaIcono from "../../assets/img/emergencia_icono.jpg";
import Swal from "sweetalert2";
import ContactosEmergenciaModal from "./contactos_emergencia_modal.jsx";
import {
  obtenerCsrfToken,
  listarServiciosEmergencia,
  crearServicioEmergencia,
  actualizarServicioEmergencia,
  eliminarServicioEmergencia,
  obtenerUsuarioLogeado
} from "../../services/servicios_emergencias";

// Componente de búsqueda para filtrar contactos
function Buscador({ busqueda, setBusqueda }) {
  return (
    <div className="input-group" style={{ maxWidth: "400px" }}>
      <input
        type="text"
        className="form-control"
        placeholder="Buscar servicio de emergencia..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar servicio de emergencia"
      />
      <span className="input-group-text">
        <Search size={18} aria-hidden="true" />
      </span>
    </div>
  );
}

// Componente para representar cada tarjeta de contacto de emergencia
function EmergenciaCard({ emergencia, onSelect, isSelected, onCardClick, dataEmergenciaId }) {
  // El modal solo se abre con el botón 'Ver información', no al hacer click en la carta
  return (
    <div className="col">
      <div
        className="card border-0 shadow-sm rounded-3 overflow-hidden bg-dark text-white"
        data-emergencia-id={dataEmergenciaId}
        style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease, opacity 0.5s" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
        role="region"
        aria-label={`Tarjeta de ${emergencia.nombre}`}
      >
        {/* Imagen representativa del servicio de emergencia */}
        <img
          src={EmergenciaIcono}
          className="card-img-top"
          alt={`Ícono de ${emergencia.nombre}`}
          style={{ objectFit: "cover", height: "150px" }}
          loading="lazy"
        />
        <div className="card-body text-center">
          <h6 className="card-title mb-2">{emergencia.nombre}</h6>
          <p className="card-text">{emergencia.descripcion}</p>
          <div className="d-flex justify-content-center align-items-center gap-2">
            <button
              className="btn btn-primary btn-sm d-flex justify-content-center align-items-center gap-2"
              onClick={() => onCardClick(emergencia)}
              aria-label={`Ver información de ${emergencia.nombre}`}
              tabIndex={-1}
            >
              Ver información
            </button>
            <input
              type="checkbox"
              className="form-check-input ms-2"
              checked={isSelected}
              onChange={e => { e.stopPropagation(); onSelect(emergencia.id); }}
              aria-label="Seleccionar para eliminar"
              tabIndex={-1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal que contiene la lista de contactos de emergencia
function ContactosEmergencia() {
  const [busqueda, setBusqueda] = useState(""); // Estado para la barra de búsqueda
  const [contactos, setContactos] = useState([]); // Estado para almacenar los contactos
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [emergenciaSeleccionada, setEmergenciaSeleccionada] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: "", descripcion: "", telefono: "" });
  const [cargando, setCargando] = useState(false);
  const [usuarioLogeado, setUsuarioLogeado] = useState(null);

  // Obtener CSRF token al cargar el componente
  useEffect(() => {
    const fetchCsrfToken = async () => {
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
    fetchCsrfToken();
  }, []);

  // Función para obtener los servicios desde el backend
  const obtenerServicios = async () => {
    try {
      setCargando(true);
      const data = await listarServiciosEmergencia();
      setContactos(data);
    } catch (error) {
      console.error('Error al obtener servicios:', error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los servicios de emergencia.'
      });
    } finally {
      setCargando(false);
    }
  };

  // Cargar servicios al montar el componente
  useEffect(() => {
    obtenerServicios();
  }, []);

  // Obtener usuario logeado
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const usuarioId = localStorage.getItem("usuario_id");
        if (!usuarioId) {
          throw new Error("No se encontró el ID del usuario en localStorage. Inicia sesión de nuevo.");
        }
        const data = await obtenerUsuarioLogeado(usuarioId);
        setUsuarioLogeado(data);
      } catch (error) {
        console.error("Error al obtener el usuario logeado:", error.message);
        setUsuarioLogeado(null);
      }
    };
    fetchUsuario();
  }, []);

  // Filtrar los contactos según el término de búsqueda
  const contactosFiltrados = contactos.filter((contacto) =>
    contacto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleSelectServicio = (id) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
  const handleCardClick = (emergencia) => {
    setEmergenciaSeleccionada(emergencia);
    setMostrarModal(true);
  };

  const handleAgregarServicio = async () => {
    if (!nuevoServicio.nombre.trim() || !nuevoServicio.telefono.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El nombre del servicio y el teléfono son obligatorios.",
      });
      return;
    }
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
      setCargando(true);
      await crearServicioEmergencia(nuevoServicio, usuarioLogeado?.id);
      obtenerServicios();
      setMostrarFormulario(false);
      setNuevoServicio({ nombre: "", descripcion: "", telefono: "" });
      Swal.fire({
        icon: "success",
        title: "¡Servicio agregado!",
        text: "El servicio de emergencia se ha agregado correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error al agregar servicio:', error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo agregar el servicio de emergencia.",
      });
    } finally {
      setCargando(false);
    }
  };

  // Función para actualizar la emergencia editada
  const actualizarEmergencia = async (emergenciaEditada) => {
    try {
      setCargando(true);
      const actualizado = await actualizarServicioEmergencia(emergenciaEditada.id, emergenciaEditada);
      setContactos(prev => prev.map(e => e.id === emergenciaEditada.id ? actualizado.servicio || emergenciaEditada : e));
      Swal.fire({
        icon: "success",
        title: "¡Servicio actualizado!",
        text: "El servicio de emergencia se ha actualizado correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error al actualizar servicio:', error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el servicio de emergencia.",
      });
    } finally {
      setCargando(false);
    }
  };

  // Lógica para eliminar servicios seleccionados con confirmación
  const handleEliminarServiciosSeleccionados = async () => {
    if (serviciosSeleccionados.length === 0) return;
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar ${serviciosSeleccionados.length > 1 ? 'estos servicios' : 'este servicio'} de emergencia?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: '<span style="font-size:1.1rem; font-weight:500;">Sí, eliminar</span>',
      cancelButtonText: '<span style="font-size:1.1rem; font-weight:500;">Cancelar</span>',
      background: 'rgba(255,255,255,0.95)',
      customClass: {
        popup: 'shadow',
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-secondary ms-2'
      },
      buttonsStyling: false
    });
    if (result.isConfirmed) {
      try {
        setCargando(true);
        serviciosSeleccionados.forEach(id => {
          const card = document.querySelector(`[data-emergencia-id="${id}"]`);
          if (card) {
            card.style.transition = 'opacity 0.5s';
            card.style.opacity = 0.3;
          }
        });
        await Promise.all(
          serviciosSeleccionados.map(id => eliminarServicioEmergencia(id))
        );
        setTimeout(() => {
          setContactos(prev => prev.filter(e => !serviciosSeleccionados.includes(e.id)));
          setServiciosSeleccionados([]);
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El servicio(s) de emergencia ha sido eliminado.',
            timer: 1200,
            showConfirmButton: false,
            background: 'rgba(255,255,255,0.95)'
          });
        }, 500);
      } catch (error) {
        console.error('Error al eliminar servicios:', error.message);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudieron eliminar algunos servicios.',
        });
        obtenerServicios();
      } finally {
        setCargando(false);
      }
    }
  };

  return (
    <div>
      {/* Encabezado de la página */}
      <h1 className="page-header">
        Contactos de Emergencia <small>Información útil</small>
      </h1>
      <Panel>
        <PanelHeader>
          <h4 className="panel-title">Lista de Contactos de Emergencia</h4>
        </PanelHeader>
        <PanelBody>
          {/* Sección del buscador */}
          <div className="row mb-3">
            <div className="col-12 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <Buscador busqueda={busqueda} setBusqueda={setBusqueda} />
              <div className="d-flex flex-wrap gap-2">
                <button
                  className="btn btn-danger"
                  onClick={handleEliminarServiciosSeleccionados}
                  disabled={serviciosSeleccionados.length === 0}
                >
                  <i className="bi bi-trash"></i> Eliminar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setMostrarFormulario(true)}
                >
                  <i className="bi bi-plus-circle"></i> Agregar Servicio
                </button>
              </div>
            </div>
          </div>
          {/* Contenedor de las tarjetas de contactos */}
          <div className="container-fluid mt-5 p-4 bg-white rounded-3 shadow">
            {cargando ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </div>
            ) : contactosFiltrados.length === 0 ? (
              <div className="text-center py-5">
                <h5 className="text-muted">No se encontraron servicios de emergencia</h5>
                <p className="text-muted">Intenta modificar los términos de búsqueda o agrega un nuevo servicio.</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {/* Se renderizan dinámicamente las tarjetas de los contactos filtrados */}
                {contactosFiltrados.map((emergencia) => (
                  <EmergenciaCard
                    key={emergencia.id}
                    emergencia={emergencia}
                    onSelect={handleSelectServicio}
                    isSelected={serviciosSeleccionados.includes(emergencia.id)}
                    onCardClick={handleCardClick}
                    dataEmergenciaId={emergencia.id}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Modal para ver detalles de emergencia */}
          {mostrarModal && (
            <div className="modal" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
              <ContactosEmergenciaModal
                emergencia={emergenciaSeleccionada}
                onClose={() => setMostrarModal(false)}
                onSave={actualizarEmergencia}
              />
            </div>
          )}
          {/* Modal para agregar servicio de emergencia */}
          {mostrarFormulario && (
            <div className="modal" style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)" }}>
                  <div className="modal-header" style={{ backgroundColor: "#0891b2", color: "white", padding: "30px", borderBottom: "none" }}>
                    <h5 className="modal-title d-flex align-items-center" style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                      <i className="fas fa-ambulance me-3" style={{ fontSize: "22px", color: "white" }}></i>
                      Agregar Servicio de Emergencia
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
                      <label className="form-label" style={{ fontWeight: "600", marginBottom: "8px" }}>Nombre del servicio de emergencia</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nuevoServicio.nombre}
                        onChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
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
                      <label className="form-label" style={{ fontWeight: "600", marginBottom: "8px" }}>Descripción del servicio de emergencia</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nuevoServicio.descripcion}
                        onChange={e => setNuevoServicio({ ...nuevoServicio, descripcion: e.target.value })}
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
                      <label className="form-label" style={{ fontWeight: "600", marginBottom: "8px" }}>Teléfono del servicio de emergencia</label>
                      <input
                        type="text"
                        className="form-control"
                        value={nuevoServicio.telefono}
                        onChange={e => setNuevoServicio({ ...nuevoServicio, telefono: e.target.value })}
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
                      onClick={handleAgregarServicio}
                      disabled={!nuevoServicio.nombre.trim() || !nuevoServicio.telefono.trim()}
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
        </PanelBody>
      </Panel>
    </div>
  );
}

// Exportamos el componente principal
export default ContactosEmergencia;
