/* grupos_modal.jsx */
/* -------------------*/

import React, { useState } from "react";
import PropTypes from "prop-types";
import { actualizarGrupo, eliminarGrupo } from "../../services/grupos";
import Swal from "sweetalert2";

// Componente modal para mostrar información detallada de un grupo
function GrupoModal({ grupo, onClose }) {
    const [editandoEstado, setEditandoEstado] = useState(false);
    const [estado, setEstado] = useState(grupo.estado ? "Activo" : "Inactivo");

    // Función para manejar el cambio de estado
    const handleEstadoChange = (e) => setEstado(e.target.value);


    // Función para guardar el estado editado (actualiza en backend)
    const guardarEstado = async () => {
        try {
            if (estado === "Inactivo") {
                // Si el usuario selecciona "Inactivo", realiza el borrado lógico
                await eliminarGrupo(grupo.id);
                Swal.fire({
                    icon: 'success',
                    title: '¡Grupo eliminado!',
                    text: 'El grupo ha sido eliminado correctamente.',
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                // Si es "Activo", solo actualiza el estado
                await actualizarGrupo(grupo.id, { estado: 'activo' });
                Swal.fire({
                    icon: "success",
                    title: "¡Actualización exitosa!",
                    text: "El estado del grupo ha sido actualizado.",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
            setEditandoEstado(false);
            onClose();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error al actualizar",
                text: error.response?.data?.message || error.message,
            });
        }
    };

    // Función para eliminar el grupo (borrado lógico en backend)
    const handleEliminarGrupo = async () => {
        const confirm = await Swal.fire({
            title: '¿Está seguro de eliminar este grupo?',
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
            await eliminarGrupo(grupo.id);
            Swal.fire({
                icon: 'success',
                title: '¡Grupo eliminado!',
                text: 'El grupo ha sido eliminado correctamente.',
                timer: 1500,
                showConfirmButton: false,
            });
            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al eliminar',
                text: error.response?.data?.message || error.message,
            });
        }
    };

    // Función para cerrar el modal y realizar acciones adicionales
    const cerrarModal = () => {
        onClose();
    };

    return (
        <div
            className="modal fade show d-flex justify-content-center align-items-center"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
            <div className="modal-dialog" role="document" style={{ maxWidth: "700px", width: "95%" }}>
                <div className="modal-content" style={{ 
                    borderRadius: "20px", 
                    border: "none", 
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)",
                    overflow: 'hidden'
                }}>
                    {/* Header del modal */}
                    <div className="modal-header text-white d-flex align-items-center justify-content-between" style={{ 
                        backgroundColor: "#0891b2", 
                        padding: "30px",
                        border: "none"
                    }}>
                        <div className="d-flex align-items-center">
                            <i className="fas fa-users me-3" style={{ fontSize: "28px", color: "white" }}></i>
                            <h5 className="modal-title mb-0" style={{ fontSize: "18px", fontWeight: 600, color: "white" }}>
                                Detalles del Grupo: <strong>{grupo.nombre}</strong>
                            </h5>
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            aria-label="Close"
                            onClick={onClose}
                            style={{ fontSize: "1.2rem" }}
                        ></button>
                    </div>

                    {/* Cuerpo del modal */}
                    <div className="modal-body" style={{ backgroundColor: "#f8f9fa", padding: "30px" }}>
                        <div className="text-center mb-4">
                            <img
                                src={grupo.imagen ? `/assets/img/${grupo.imagen}` : "/assets/img/911.jpg"}
                                alt={`Imagen de ${grupo.nombre}`}
                                style={{
                                    width: "150px", 
                                    height: "150px",
                                    borderRadius: "50%", 
                                    objectFit: "cover", 
                                    border: "4px solid #0891b2",
                                    boxShadow: "0 8px 16px rgba(8, 145, 178, 0.3)"
                                }}
                                loading="lazy"
                            />
                        </div>
                        
                        <div className="row g-4">
                            <div className="col-12 col-md-6">
                                <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-hashtag me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>ID del Grupo</h6>
                                    </div>
                                    <div className="fw-semibold" style={{ fontSize: "1.2rem", color: "#212529" }}>{grupo.id}</div>
                                </div>
                            </div>
                            
                            <div className="col-12 col-md-6">
                                <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-users me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>Miembros</h6>
                                    </div>
                                    <div className="fw-semibold" style={{ fontSize: "1.2rem", color: "#212529" }}>{grupo.miembros}</div>
                                </div>
                            </div>
                            
                            <div className="col-12">
                                <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-info-circle me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>Descripción del Grupo</h6>
                                    </div>
                                    <div className="fw-semibold" style={{ fontSize: "1.1rem", color: "#212529" }}>{grupo.descripcion || "Sin descripción"}</div>
                                </div>
                            </div>
                            
                            <div className="col-12">
                                <div className="bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                                    <div className="d-flex align-items-center mb-3">
                                        <i className="fas fa-toggle-on me-3" style={{ fontSize: "20px", color: "#0891b2" }}></i>
                                        <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1.1rem" }}>Estado del Grupo</h6>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-center">
                                        {!editandoEstado ? (
                                            <span className="badge d-flex align-items-center justify-content-center gap-2" style={{ 
                                                background: "#0891b2", 
                                                color: "#fff", 
                                                fontSize: "1.05rem", 
                                                padding: "10px 32px", 
                                                borderRadius: "24px", 
                                                fontWeight: 700, 
                                                letterSpacing: 1, 
                                                boxShadow: "0 2px 8px #0891b233", 
                                                minWidth: 120 
                                            }}>
                                                <span style={{ 
                                                    display: "inline-block", 
                                                    width: 14, 
                                                    height: 14, 
                                                    background: "#fff", 
                                                    borderRadius: "50%", 
                                                    marginRight: 6, 
                                                    boxShadow: "0 0 0 2px #0891b2" 
                                                }}></span>
                                                {estado}
                                            </span>
                                        ) : (
                                            <select 
                                                className="form-select"
                                                value={estado} 
                                                onChange={handleEstadoChange}
                                                style={{ 
                                                    borderColor: "#0891b2",
                                                    focusColor: "#0891b2",
                                                    maxWidth: "200px"
                                                }}
                                            >
                                                <option value="Activo">Activo</option>
                                                <option value="Inactivo">Inactivo</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer del modal */}
                    <div className="modal-footer bg-white d-flex justify-content-center border-0" style={{ padding: "30px" }}>
                        <div className="d-flex gap-3">
                            {!editandoEstado ? (
                                <button
                                    className="btn d-flex align-items-center justify-content-center"
                                    onClick={() => setEditandoEstado(true)}
                                    style={{ 
                                        backgroundColor: "#0891b2",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "14px",
                                        padding: "10px 32px",
                                        fontSize: "1.08rem",
                                        fontWeight: 600,
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)"
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#0782a1"}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#0891b2"}
                                >
                                    <i className="fas fa-edit me-2"></i> Editar Estado
                                </button>
                            ) : (
                                <button
                                    className="btn d-flex align-items-center justify-content-center"
                                    onClick={guardarEstado}
                                    style={{ 
                                        backgroundColor: "#0891b2",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "14px",
                                        padding: "10px 32px",
                                        fontSize: "1.08rem",
                                        fontWeight: 600,
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 4px 12px rgba(8, 145, 178, 0.3)"
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = "#0782a1"}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = "#0891b2"}
                                >
                                    <i className="fas fa-save me-2"></i> Guardar Estado
                                </button>
                            )}
                            <button
                                className="btn d-flex align-items-center justify-content-center"
                                onClick={handleEliminarGrupo}
                                style={{ 
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "14px",
                                    padding: "10px 32px",
                                    fontSize: "1.08rem",
                                    fontWeight: 600,
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)"
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = "#c82333"}
                                onMouseLeave={(e) => e.target.style.backgroundColor = "#dc3545"}
                            >
                                <i className="fas fa-trash me-2"></i> Eliminar Grupo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Validación de tipos de props
GrupoModal.propTypes = {
    grupo: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // ID del grupo
        nombre: PropTypes.string.isRequired, // Nombre del grupo
        miembros: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // Número de miembros
        estado: PropTypes.bool.isRequired, // Estado activo/inactivo
        descripcion: PropTypes.string, // Descripción del grupo
        imagen: PropTypes.string, // Imagen del grupo
    }).isRequired,
    onClose: PropTypes.func.isRequired, // Función para cerrar el modal
};

export default GrupoModal;
