import React, { useState } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { FaPhoneAlt, FaAmbulance, FaRegStickyNote } from "react-icons/fa";
import { actualizarServicioEmergencia } from "../../services/servicios_emergencias";

function ContactosEmergenciaModal({ emergencia, onClose, onSave }) {
  const [form, setForm] = useState({
    nombre: emergencia.nombre || "", 
    descripcion: emergencia.descripcion || "",
    telefono: emergencia.telefono || ""
  });
  const [editando, setEditando] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.telefono.trim()) { 
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "El nombre del servicio y el teléfono son obligatorios."
      });
      return;
    }
    // Solo usa la función del servicio, no axios directo
    await actualizarServicioEmergencia(emergencia.id, { ...emergencia, ...form });
    setEditando(false);
    onClose();
    if (onSave) onSave({ ...emergencia, ...form });
  };

  return (
    <div
      className="modal fade show d-flex justify-content-center align-items-center"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex" }}
    >
      <div className="modal-dialog" style={{ maxWidth: "600px" }} role="document">
        <div className="modal-content" style={{ borderRadius: "20px", overflow: "hidden", border: "none", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3), 0 10px 20px rgba(0, 0, 0, 0.2)" }}>
          <div className="modal-header text-white border-0 d-flex align-items-center justify-content-between" style={{ backgroundColor: "#0891b2", padding: "30px" }}>
            <div className="d-flex align-items-center">
              <FaAmbulance className="me-3" size={28} style={{ color: "white" }} />
              <h5 className="modal-title mb-0" style={{ fontSize: "18px", fontWeight: 600, color: "white" }}>
                Detalles del Servicio de Emergencia
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Cerrar"
              onClick={onClose}
              style={{ fontSize: "1.2rem" }}
            ></button>
          </div>
          <div className="modal-body" style={{ backgroundColor: "#f8f9fa", padding: "30px" }}>
            <div className="row g-4">
              <div className="col-12">
                <div className="d-flex flex-column align-items-center bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                  <FaAmbulance className="mb-3" size={28} style={{ color: "#0891b2" }} />
                  <label htmlFor="nombreServicio" className="form-label mb-2 text-center" style={{ fontWeight: 600, color: "#495057" }}>Nombre del servicio de emergencia</label>
                  {editando ? (
                    <input
                      id="nombreServicio"
                      type="text"
                      name="nombre"
                      className="form-control text-center"
                      value={form.nombre}
                      onChange={handleChange}
                      style={{ 
                        borderRadius: "12px", 
                        padding: "12px 16px", 
                        fontSize: "1rem",
                        border: "2px solid #e9ecef",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#0891b2"}
                      onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                    />
                  ) : (
                    <div className="fw-bold text-center w-100" style={{ fontSize: "1.1rem", color: "#212529", marginTop: "8px" }}>{form.nombre}</div>
                  )}
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex flex-column align-items-center bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                  <FaRegStickyNote className="mb-3" size={28} style={{ color: "#0891b2" }} />
                  <label htmlFor="descripcionServicio" className="form-label mb-2 text-center" style={{ fontWeight: 600, color: "#495057" }}>Descripción del servicio de emergencia</label>
                  {editando ? (
                    <input
                      id="descripcionServicio"
                      type="text"
                      name="descripcion"
                      className="form-control text-center"
                      value={form.descripcion}
                      onChange={handleChange}
                      style={{ 
                        borderRadius: "12px", 
                        padding: "12px 16px", 
                        fontSize: "1rem",
                        border: "2px solid #e9ecef",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#0891b2"}
                      onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                    />
                  ) : (
                    <div className="text-center w-100" style={{ fontSize: "1.1rem", color: "#212529", marginTop: "8px" }}>{form.descripcion}</div>
                  )}
                </div>
              </div>
              <div className="col-12">
                <div className="d-flex flex-column align-items-center bg-white p-4 shadow-sm" style={{ borderRadius: "15px", border: "2px solid #e9ecef" }}>
                  <FaPhoneAlt className="mb-3" size={28} style={{ color: "#0891b2" }} />
                  <label htmlFor="telefonoServicio" className="form-label mb-2 text-center" style={{ fontWeight: 600, color: "#495057" }}>Teléfono del servicio de emergencia</label>
                  {editando ? (
                    <input
                      id="telefonoServicio"
                      type="text"
                      name="telefono"
                      className="form-control text-center"
                      value={form.telefono}
                      onChange={handleChange}
                      style={{ 
                        borderRadius: "12px", 
                        padding: "12px 16px", 
                        fontSize: "1rem",
                        border: "2px solid #e9ecef",
                        transition: "all 0.3s ease"
                      }}
                      onFocus={(e) => e.target.style.borderColor = "#0891b2"}
                      onBlur={(e) => e.target.style.borderColor = "#e9ecef"}
                    />
                  ) : (
                    <div className="text-center w-100" style={{ fontSize: "1.1rem", color: "#212529", marginTop: "8px" }}>{form.telefono}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer bg-white d-flex justify-content-center border-0" style={{ padding: "30px" }}>
            {!editando ? (
              <button
                className="btn d-flex align-items-center justify-content-center"
                onClick={() => setEditando(true)}
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
                <i className="fas fa-edit me-2"></i> Editar Servicio
              </button>
            ) : (
              <button
                className="btn d-flex align-items-center justify-content-center"
                onClick={handleSave}
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
                <i className="fas fa-save me-2"></i> Guardar Cambios
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ContactosEmergenciaModal.propTypes = {
  emergencia: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nombre: PropTypes.string, 
    descripcion: PropTypes.string,
    telefono: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func
};

export default ContactosEmergenciaModal;
