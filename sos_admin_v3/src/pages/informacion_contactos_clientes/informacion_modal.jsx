import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import axios from "axios";
import { FaTrash, FaUserCircle, FaPhone } from "react-icons/fa";
import { listarContactosEmergenciaPorCliente, eliminarContactoEmergencia, obtenerCsrfToken } from "../../services/clientes";

function InformacionModal({ informacion, onClose }) {
    const [numeros, setNumeros] = useState([]);
    const [contactos, setContactos] = useState([]); // Mantener contactos para la estructura original si es necesario
    const [loading, setLoading] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const contactosPorPagina = 4;

    // Cargar contactos del cliente desde el backend
    useEffect(() => {
        const cargarContactos = async () => {
            try {
                setLoading(true);
                await obtenerCsrfToken();
                const contactos = await listarContactosEmergenciaPorCliente(informacion.id);
                setContactos(contactos);
                const numerosFormateados = contactos.map(contacto => ({
                    id: contacto.id,
                    nombre: contacto.nombre,
                    telefono: contacto.telefono,
                    descripcion: contacto.descripcion
                }));
                setNumeros(numerosFormateados);
            } catch (error) {
                console.error('Error al cargar contactos:', error);
                Swal.fire('Error', 'No se pudieron cargar los contactos', 'error');
            } finally {
                setLoading(false);
            }
        };
        if (informacion.id) {
            cargarContactos();
        }
    }, [informacion.id]);

    // Lógica de paginación
    const indiceUltimoContacto = paginaActual * contactosPorPagina;
    const indicePrimerContacto = indiceUltimoContacto - contactosPorPagina;
    const contactosActuales = numeros.slice(indicePrimerContacto, indiceUltimoContacto);
    const totalPaginas = Math.ceil(numeros.length / contactosPorPagina);

    const cambiarPagina = (numeroPagina) => {
        setPaginaActual(numeroPagina);
    };

    const paginaAnterior = () => {
        if (paginaActual > 1) {
            setPaginaActual(paginaActual - 1);
        }
    };

    const paginaSiguiente = () => {
        if (paginaActual < totalPaginas) {
            setPaginaActual(paginaActual + 1);
        }
    };

    const confirmarEliminarNumero = async (contactoId, nombre) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `Se eliminará el contacto: "${nombre}"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#0891b2',
            confirmButtonText: 'Sí, ¡eliminar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await obtenerCsrfToken();
                await eliminarContactoEmergencia(contactoId);
                const numerosActualizados = numeros.filter(numero => numero.id !== contactoId);
                setNumeros(numerosActualizados);
                const nuevasPaginas = Math.ceil(numerosActualizados.length / contactosPorPagina);
                if (paginaActual > nuevasPaginas && nuevasPaginas > 0) {
                    setPaginaActual(nuevasPaginas);
                }
                await Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El contacto ha sido eliminado.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                console.error('Error al eliminar contacto:', error.response?.data || error.message);
                Swal.fire(
                    'Error', 
                    error.response?.data?.message || error.response?.data?.error || 'No se pudo eliminar el contacto.',
                    'error'
                );
            }
        }
    };

    return (
        <div
            className="modal fade show d-flex justify-content-center align-items-center"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
            <div
                className="modal-dialog"
                style={{ maxWidth: "600px", width: "95%" }}
            >
                <div
                    className="modal-content"
                    style={{
                        borderRadius: "15px",
                        border: "none",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                        overflow: 'hidden',
                    }}
                >
                    <div className="modal-header text-white d-flex align-items-center justify-content-between" style={{ backgroundColor: "#0891b2", padding: "20px" }}>
                        <div className="d-flex align-items-center">
                            <FaUserCircle className="me-2" size={22} style={{ color: "white" }} />
                            <h5 className="modal-title mb-0" style={{ fontSize: "16px", fontWeight: 600, color: "white" }}>
                                Detalles del Cliente: <strong>{informacion.nombre}</strong>
                            </h5>
                        </div>
                        <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={onClose} style={{ fontSize: "1rem" }}></button>
                    </div>

                    <div className="modal-body" style={{ backgroundColor: "#f8f9fa", padding: "20px" }}>
                        <div className="text-center mb-3">
                            <img
                                src="/assets/img/con_cliente.jpg"
                                alt="Imagen del cliente"
                                style={{
                                    width: "100px", height: "100px",
                                    borderRadius: "50%", objectFit: "cover", 
                                    border: "3px solid #0891b2",
                                    boxShadow: "0 4px 8px rgba(8, 145, 178, 0.3)"
                                }}
                            />
                        </div>
                        
                        <div className="row g-3">
                            <div className="col-12">
                                <div className="bg-white p-3 shadow-sm" style={{ borderRadius: "10px", border: "1px solid #e9ecef" }}>
                                    <div className="d-flex align-items-center mb-2">
                                        <FaUserCircle className="me-2" size={18} style={{ color: "#0891b2" }} />
                                        <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1rem" }}>Información del Cliente</h6>
                                    </div>
                                    <div className="row">
                                        <div className="col-4">
                                            <strong style={{ color: "#0891b2", fontSize: "0.9rem" }}>Nombre:</strong>
                                        </div>
                                        <div className="col-8">
                                            <span style={{ fontSize: "0.95rem", color: "#212529" }}>{informacion.nombre}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-12">
                                <div className="bg-white p-3 shadow-sm" style={{ borderRadius: "10px", border: "1px solid #e9ecef" }}>
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <div className="d-flex align-items-center">
                                            <FaPhone className="me-2" size={18} style={{ color: "#0891b2" }} />
                                            <h6 className="mb-0" style={{ fontWeight: 600, color: "#495057", fontSize: "1rem" }}>Contactos de Emergencia</h6>
                                        </div>
                                        {totalPaginas > 1 && (
                                            <small className="text-muted">
                                                Página {paginaActual} de {totalPaginas} ({numeros.length} contactos)
                                            </small>
                                        )}
                                    </div>
                                    
                                    {loading ? (
                                        <div className="text-center py-2">
                                            <div className="spinner-border text-primary spinner-border-sm" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </div>
                                    ) : numeros.length > 0 ? (
                                        <>
                                            <div className="row g-2">
                                                {contactosActuales.map((contacto) => (
                                                    <div key={contacto.id} className="col-12">
                                                        <div className="d-flex align-items-center justify-content-between p-2 border rounded-2" style={{ backgroundColor: "#f8f9fa" }}>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <FaUserCircle className="me-2" size={14} style={{ color: "#0891b2" }} />
                                                                    <strong style={{ fontSize: "0.9rem", color: "#495057" }}>{contacto.nombre}</strong>
                                                                </div>
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <FaPhone className="me-2" size={12} style={{ color: "#6c757d" }} />
                                                                    <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>{contacto.telefono}</span>
                                                                </div>
                                                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                                                    {contacto.descripcion}
                                                                </div>
                                                            </div>
                                                            <button 
                                                                className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center" 
                                                                onClick={() => confirmarEliminarNumero(contacto.id, contacto.nombre)}
                                                                style={{ 
                                                                    borderRadius: "6px",
                                                                    padding: "4px 8px",
                                                                    fontSize: "0.8rem",
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                <FaTrash size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Paginación */}
                                            {totalPaginas > 1 && (
                                                <div className="d-flex justify-content-center align-items-center mt-3">
                                                    <nav>
                                                        <ul className="pagination pagination-sm mb-0">
                                                            <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
                                                                <button 
                                                                    className="page-link" 
                                                                    onClick={paginaAnterior}
                                                                    disabled={paginaActual === 1}
                                                                    style={{ fontSize: "0.8rem" }}
                                                                >
                                                                    Anterior
                                                                </button>
                                                            </li>
                                                            {Array.from({ length: totalPaginas }, (_, i) => (
                                                                <li key={i + 1} className={`page-item ${paginaActual === i + 1 ? 'active' : ''}`}>
                                                                    <button 
                                                                        className="page-link" 
                                                                        onClick={() => cambiarPagina(i + 1)}
                                                                        style={{ 
                                                                            fontSize: "0.8rem",
                                                                            backgroundColor: paginaActual === i + 1 ? "#0891b2" : "",
                                                                            borderColor: paginaActual === i + 1 ? "#0891b2" : ""
                                                                        }}
                                                                    >
                                                                        {i + 1}
                                                                    </button>
                                                                </li>
                                                            ))}
                                                            <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
                                                                <button 
                                                                    className="page-link" 
                                                                    onClick={paginaSiguiente}
                                                                    disabled={paginaActual === totalPaginas}
                                                                    style={{ fontSize: "0.8rem" }}
                                                                >
                                                                    Siguiente
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-2">
                                            <span className="text-muted" style={{ fontSize: "0.9rem" }}>No hay contactos de emergencia registrados.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer bg-white d-flex justify-content-center border-0" style={{ padding: "15px" }}>
                        <button
                            className="btn d-flex align-items-center justify-content-center"
                            onClick={onClose}
                            style={{ 
                                backgroundColor: "#6c757d",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 20px",
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                transition: "all 0.3s ease"
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = "#5a6169"}
                            onMouseLeave={(e) => e.target.style.backgroundColor = "#6c757d"}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

InformacionModal.propTypes = {
    informacion: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nombre: PropTypes.string.isRequired,
        eliminado: PropTypes.bool.isRequired,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default InformacionModal;
