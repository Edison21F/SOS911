import React, { useState, useEffect } from "react";
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx";
import { Search, Trash } from "lucide-react";
import UsuarioModal from "./usuario_modal.jsx";
import "../../assets/scss/gestion_usuarios.scss";
import Swal from "sweetalert2";
import { listarUsuarios, eliminarUsuario, obtenerCsrfToken } from "../../services/usuarios";

const BASE_IMG_URL = "/assets/img/";
const DEFAULT_IMG = "foto3.jpg";

function UsuarioCard({ usuario, onVerInformacionClick, onSelectUsuario, isSelected, isEliminado }) {
    return (
        <div
            className={`col ${isEliminado ? "bg-light text-danger" : ""}`}
            style={{
                transition: "transform 0.2s ease", // Suaviza el efecto de zoom
                opacity: isEliminado ? 0.5 : 1, // Reducimos opacidad para usuarios eliminados
            }}
            onMouseEnter={(e) => {
                if (!isEliminado) {
                    e.currentTarget.style.transform = "scale(1.05)"; // Efecto de zoom reducido
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"; // Vuelve al tamaño original
            }}
        >
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                <img
                    src={`${BASE_IMG_URL}${usuario.imagen || DEFAULT_IMG}`}
                    className="card-img-top"
                    alt={`Imagen de ${usuario.nombre}`}
                    style={{ objectFit: "cover", height: "200px", width: "100%" }}
                />
                <div className="card-body bg-dark text-white text-center">
                    <h6 className="card-title mb-2" style={{ fontSize: "calc(1rem + 2px)" }}>
                        {usuario.nombre}
                    </h6>
                    <button className="btn btn-primary btn-sm" onClick={() => onVerInformacionClick(usuario)}>
                        Ver Información
                    </button>
                    <div className="form-check mt-2">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => onSelectUsuario(usuario.id)}
                            disabled={isEliminado} // Deshabilitamos selección para usuarios eliminados
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function GestionUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const usuariosPorPagina = 8;

    useEffect(() => {
        const cargarUsuarios = async () => {
            try {
                await obtenerCsrfToken(); // Asegura el token
                const data = await listarUsuarios();
                setUsuarios(data);
            } catch (error) {
                console.error("Error al cargar usuarios:", error);
            }
        };
        cargarUsuarios();
    }, []);

    const eliminarUsuarioHandler = async (id) => {
        try {
            await eliminarUsuario(id);
            Swal.fire({
                icon: "info",
                title: "Usuario Eliminado",
                text: "El usuario ha sido marcado como inactivo.",
                confirmButtonText: "OK",
            });
            actualizarEstadoUsuario(id, "eliminado");
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un error al eliminar el usuario.",
            });
        }
    };

    const handleEliminarUsuarios = async () => {
        if (usuariosSeleccionados.length === 0) return;
        const confirm = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar ${usuariosSeleccionados.length > 1 ? 'estos usuarios' : 'este usuario'}? Esta acción es reversible (se marcarán como inactivos).`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (confirm.isConfirmed) {
            for (const id of usuariosSeleccionados) {
                await eliminarUsuarioHandler(id);
            }
            setUsuariosSeleccionados([]);
        }
    };

    const handleEstadoDesdeModal = (id, nuevoEstado) => {
        actualizarEstadoUsuario(id, nuevoEstado);
    };

    const actualizarEstadoUsuario = (id, nuevoEstado) => {
        setUsuarios((prevUsuarios) =>
            prevUsuarios.map((u) =>
                u.id === id ? { ...u, estado: nuevoEstado } : u
            )
        );
    };

    const handleSeleccionarUsuario = (id) => {
        setUsuariosSeleccionados((prev) =>
            prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
        );
    };

    const usuariosFiltrados = usuarios.filter((u) =>
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    );

    const usuariosOrdenados = [
        ...usuariosFiltrados.filter((u) => u.estado !== "eliminado"),
        ...usuariosFiltrados.filter((u) => u.estado === "eliminado"),
    ];

    const indexOfLastUser = paginaActual * usuariosPorPagina;
    const indexOfFirstUser = indexOfLastUser - usuariosPorPagina;
    const usuariosMostrados = usuariosOrdenados.slice(indexOfFirstUser, indexOfLastUser);
    const totalPaginas = Math.ceil(usuariosOrdenados.length / usuariosPorPagina);

    const handleCambiarPagina = (pagina) => {
        setPaginaActual(pagina);
    };

    return (
        <div>
            <h1 className="page-header">
                Gestión de Usuarios <small>administración de usuarios</small>
            </h1>

            <Panel>
                <PanelHeader>
                    <h4 className="panel-title">Usuarios</h4>
                </PanelHeader>
                <PanelBody>
                    <div className="row mb-3">
                        <div className="col-12 d-flex flex-wrap justify-content-between align-items-center gap-3">
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
                            <button
                                className="btn btn-danger"
                                onClick={handleEliminarUsuarios}
                                disabled={usuariosSeleccionados.length === 0}
                            >
                                <Trash size={18} /> Eliminar
                            </button>
                        </div>
                    </div>

                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {usuariosMostrados.map((usuario) => (
                            <UsuarioCard
                                key={usuario.id}
                                usuario={usuario}
                                onVerInformacionClick={setUsuarioSeleccionado}
                                onSelectUsuario={handleSeleccionarUsuario}
                                isSelected={usuariosSeleccionados.includes(usuario.id)}
                                isEliminado={usuario.estado === "eliminado"}
                            />
                        ))}
                    </div>

                    <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-end">
                            <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => handleCambiarPagina(paginaActual - 1)}>
                                    Anterior
                                </button>
                            </li>
                            {[...Array(totalPaginas)].map((_, i) => (
                                <li
                                    key={i}
                                    className={`page-item ${paginaActual === i + 1 ? "active" : ""}`}
                                >
                                    <button className="page-link" onClick={() => handleCambiarPagina(i + 1)}>
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${paginaActual === totalPaginas ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => handleCambiarPagina(paginaActual + 1)}>
                                    Siguiente
                                </button>
                            </li>
                        </ul>
                    </nav>
                </PanelBody>
            </Panel>

            {usuarioSeleccionado && (
                <UsuarioModal
                    usuario={usuarioSeleccionado}
                    onClose={() => setUsuarioSeleccionado(null)}
                    onEstadoActualizado={handleEstadoDesdeModal} // Pasamos la función correctamente
                />
            )}
        </div>
    );
}

export default GestionUsuarios;
