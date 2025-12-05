/* rol_modal.jsx */
/* -------------------*/
import React, { useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { actualizarRol } from "../../services/roles";

// Componente modal para mostrar información detallada del rol
function RolModal({ rol, onClose, onSave, usuarioLogeado }) {
  const [nombreRol, setNombreRol] = useState(rol.nombre); // Estado para editar el nombre del rol
  const [editandoRol, setEditandoRol] = useState(false); // Estado para gestionar el modo de edición

  // Función para cerrar el modal
  const cerrarModal = () => {
    onClose(); // Cierra el modal
  };

  // Función para guardar los cambios
  const handleSave = async () => {
    const rolEditado = { ...rol, nombre: nombreRol };
    setEditandoRol(false);
    cerrarModal();

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
      // Mostrar carga mientras se actualiza
      Swal.fire({
        title: 'Guardando...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      // Llamar a onSave (que ahora es optimista en el componente padre)
      // onSave se encarga de actualizar el estado de la lista de roles en el componente padre.
      onSave(rolEditado);

      // Llamada al backend
      await actualizarRol(rol.id, rolEditado);

      Swal.fire({
        icon: "success",
        title: "¡Actualizado el Rol con Exito!",
        text: "El rol se ha editado correctamente.",
        timer: 1500,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Error al guardar los cambios del rol:", error.response?.data?.message || error.message);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.response?.data?.message || "No se pudo guardar el rol. Por favor, inténtelo de nuevo.",
      });
      // Opcional: Si la actualización optimista falló, podrías querer revertir el estado en el padre
      // Esto requeriría que `onSave` devuelva una promesa y que aquí se maneje el rechazo.
      // Por simplicidad, el `onClose` del modal principal ya recarga los roles.
    }
  };

  return (
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      tabIndex="-1"
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: "900px",
          borderRadius: "20px",
          overflow: "hidden",
          border: "none",
        }}
        role="document"
      >
        <div 
          className="modal-content" 
          style={{ 
            border: "none", 
            borderRadius: "20px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)" 
          }}
        >
          {/* Encabezado del modal */}
          <div 
            className="modal-header border-0" 
            style={{ 
              background: "#0891b2",
              color: "white",
              padding: "20px 30px",
              borderRadius: "20px 20px 0 0"
            }}
          >
            <h5
              className="modal-title"
              style={{
                fontSize: "18px",
                fontWeight: "600",
                margin: 0
              }}
            >
              <i className="fas fa-user-shield me-2"></i>
              Detalles del Rol: <strong>{rol.nombre}</strong>
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={cerrarModal}
              style={{
                opacity: "0.8",
                fontSize: "1.2rem"
              }}
            ></button>
          </div>

          {/* Cuerpo del modal */}
          <div className="modal-body bg-white" style={{ padding: "30px" }}>
            <div className="text-center mb-4">
              <img
                src="/assets/img/usuario.jpg" // Ruta de la imagen del rol
                alt={`Imagen de ${rol.nombre}`}
                className="rounded-circle"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
                  border: "4px solid #f8f9fa"
                }}
              />
            </div>
            <table className="table table-borderless mx-auto" style={{ width: "100%", fontSize: "16px" }}>
              <tbody>
                <tr>
                  <th style={{ textAlign: "left", width: "30%", color: "#495057", fontWeight: "600" }}>
                    Nombre del Rol:
                  </th>
                  <td style={{ textAlign: "left" }}>
                    {editandoRol ? (
                      <input
                        type="text"
                        value={nombreRol}
                        onChange={(e) => setNombreRol(e.target.value)}
                        className="form-control"
                        style={{
                          borderRadius: "10px",
                          border: "2px solid #e9ecef",
                          padding: "10px 15px",
                          fontSize: "16px",
                          transition: "border-color 0.3s ease"
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#0891b2"}
                        onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                      />
                    ) : (
                      <span style={{ color: "#212529", fontWeight: "500" }}>{rol.nombre}</span>
                    )}
                  </td>
                </tr>
                {/* El ID del usuario logeado NO se muestra ni se edita */}
              </tbody>
            </table>
          </div>

          {/* Footer del modal */}
          <div 
            className="modal-footer bg-light d-flex justify-content-center"
            style={{ 
              padding: "20px 30px",
              borderRadius: "0 0 20px 20px",
              borderTop: "1px solid #dee2e6"
            }}
          >
            {!editandoRol ? (
              <button
                className="btn btn-primary me-2 d-flex align-items-center justify-content-center"
                style={{ 
                  fontWeight: 600, 
                  fontSize: "1.08rem", 
                  padding: "10px 32px", 
                  borderRadius: "14px" 
                }}
                onClick={() => setEditandoRol(true)}
              >
                <i className="fas fa-edit me-1"></i> Editar Rol
              </button>
            ) : (
              <button 
                className="btn btn-primary me-2 d-flex align-items-center justify-content-center" 
                onClick={handleSave}
                style={{ 
                  fontWeight: 600, 
                  fontSize: "1.08rem", 
                  padding: "10px 32px", 
                  borderRadius: "14px" 
                }}
              >
                <i className="fas fa-save me-1"></i> Guardar Rol
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Validación de tipos de props
RolModal.propTypes = {
  rol: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    nombre: PropTypes.string.isRequired,
    estado: PropTypes.string, // Añadido para consistencia con el backend
    fecha_creacion: PropTypes.string, // Añadido para consistencia
    fecha_modificacion: PropTypes.string, // Añadido para consistencia
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  usuarioLogeado: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string,
  }),
};

export default RolModal;
