/* gestion_boton.jsx */
/* -------------------*/
import React, { useState, useCallback } from "react";
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx";
import { Search, Trash } from "lucide-react";
import Botonmodal from "./gestion_boton_modal.jsx";
import notificacion_ from "../../assets/img/boton.jpg"; // Importamos la imagen "boton.jpg" para usarla en las tarjetas

/**
 * Sanitizar texto para evitar riesgos de inyección.
 * @param {string} text - El texto a sanitizar.
 * @returns {string} El texto sanitizado.
 */
const sanitizeText = (text) => text.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, "").trim();

/**
 * Componente que representa una tarjeta de usuario.
 */
function UsuarioCard({ usuario, onVerInformacionClick, onSelectUsuario, isSelected, isDeleted }) {
    return (
        <div
            className={`col ${isDeleted ? "bg-light text-danger" : ""}`}
            style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                opacity: isDeleted ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
                if (!isDeleted) {
                    e.currentTarget.style.transform = "scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
                }
            }}
            onMouseLeave={(e) => {
                if (!isDeleted) {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.1)";
                }
            }}
        >
            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                {/* Imagen de la tarjeta: usamos siempre la imagen importada "boton.jpg" */}
                <img
                    src={notificacion_} // Usamos la imagen importada como fuente
                    className="card-img-top"
                    alt="Imagen predeterminada"
                    style={{
                        objectFit: "cover",
                        height: "200px",
                        width: "100%",
                    }}
                />
                <div className="card-body bg-dark text-white text-center">
                    <h6 className="card-title mb-2" style={{ fontSize: "calc(1rem + 2px)" }}>
                        {sanitizeText(usuario.nombre)}
                    </h6>
                    {/* Botón para ver información del usuario */}
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onVerInformacionClick(usuario)}
                    >
                        Ver Información
                    </button>
                    {/* Checkbox para seleccionar usuarios */}
                    <div className="form-check mt-2">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={isSelected}
                            onChange={() => onSelectUsuario(usuario.id)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Componente principal para la gestión de botones.
 */
function GestionBoton() {
    // Estado inicial para los usuarios
    const [usuarios, setUsuarios] = useState([
        { id: 1, nombre: "Ismael Vargas", eliminado: false },
        { id: 2, nombre: "Juan Pérez", eliminado: false },
        { id: 3, nombre: "María López", eliminado: false },
        { id: 4, nombre: "Carlos Gómez", eliminado: false },
    ]);

    const [busqueda, setBusqueda] = useState(""); // Estado para la barra de búsqueda
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null); // Usuario seleccionado
    const [usuariosSeleccionados, setUsuariosSeleccionados] = useState([]); // Usuarios seleccionados
    const [paginaActual, setPaginaActual] = useState(1); // Página actual para la paginación
    const usuariosPorPagina = 8; // Cantidad de usuarios por página

    // Filtrar usuarios según el término de búsqueda
    const usuariosFiltrados = usuarios.filter((usuario) =>
        sanitizeText(usuario.nombre.toLowerCase()).includes(sanitizeText(busqueda.toLowerCase()))
    );

    // Ordenar usuarios mostrando primero los no eliminados
    const usuariosOrdenados = [
        ...usuariosFiltrados.filter((usuario) => !usuario.eliminado),
        ...usuariosFiltrados.filter((usuario) => usuario.eliminado),
    ];

    // Calcular los índices para la paginación
    const indexOfLastUser = paginaActual * usuariosPorPagina;
    const indexOfFirstUser = indexOfLastUser - usuariosPorPagina;
    const usuariosMostrados = usuariosOrdenados.slice(indexOfFirstUser, indexOfLastUser);

    const totalPaginas = Math.ceil(usuariosOrdenados.length / usuariosPorPagina); // Total de páginas

    // Manejar eliminación de usuarios seleccionados
    const handleEliminarUsuarios = useCallback(() => {
        const usuariosActualizados = usuarios.map((usuario) =>
            usuariosSeleccionados.includes(usuario.id) ? { ...usuario, eliminado: true } : usuario
        );
        setUsuarios(usuariosActualizados);
        setUsuariosSeleccionados([]);
    }, [usuarios, usuariosSeleccionados]);

    // Manejar selección de usuarios
    const handleSeleccionarUsuario = useCallback(
        (id) => {
            setUsuariosSeleccionados((prevSeleccionados) =>
                prevSeleccionados.includes(id)
                    ? prevSeleccionados.filter((usuarioId) => usuarioId !== id)
                    : [...prevSeleccionados, id]
            );
        },
        [setUsuariosSeleccionados]
    );

    return (
        <div>
            <h1 className="page-header">
                Gestión de Botones <small></small>
            </h1>
            <Panel>
                <PanelHeader>
                    <h4 className="panel-title">Botones</h4>
                </PanelHeader>
                <PanelBody>
                    <div className="row mb-3">
                        <div className="col-12 d-flex flex-wrap justify-content-between align-items-center gap-3">
                            {/* Barra de búsqueda */}
                            <div className="input-group" style={{ maxWidth: "400px" }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Buscar botón..."
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(sanitizeText(e.target.value))}
                                />
                                <span className="input-group-text">
                                    <Search size={18} />
                                </span>
                            </div>
                            {/* Botón para eliminar usuarios seleccionados */}
                            <button
                                className="btn btn-danger"
                                onClick={handleEliminarUsuarios}
                                disabled={usuariosSeleccionados.length === 0}
                            >
                                <Trash size={18} /> Eliminar
                            </button>
                        </div>
                    </div>

                    {/* Lista de usuarios mostrados */}
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {usuariosMostrados.map((usuario) => (
                            <UsuarioCard
                                key={usuario.id}
                                usuario={usuario}
                                onVerInformacionClick={setUsuarioSeleccionado}
                                onSelectUsuario={handleSeleccionarUsuario}
                                isSelected={usuariosSeleccionados.includes(usuario.id)}
                                isDeleted={usuario.eliminado}
                            />
                        ))}
                    </div>

                    {/* Paginación */}
                    <nav aria-label="Page navigation" className="mt-4">
                        <ul className="pagination justify-content-end">
                            <li className={`page-item ${paginaActual === 1 ? "disabled" : ""}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                                >
                                    Anterior
                                </button>
                            </li>
                            {[...Array(totalPaginas)].map((_, index) => (
                                <li
                                    key={index}
                                    className={`page-item ${paginaActual === index + 1 ? "active" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setPaginaActual(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li
                                className={`page-item ${
                                    paginaActual === totalPaginas ? "disabled" : ""
                                }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                                >
                                    Siguiente
                                </button>
                            </li>
                        </ul>
                    </nav>
                </PanelBody>
            </Panel>

            {/* Modal para ver información del usuario */}
            {usuarioSeleccionado && (
                <Botonmodal usuario={usuarioSeleccionado} onClose={() => setUsuarioSeleccionado(null)} />
            )}
        </div>
    );
}

export default GestionBoton;
