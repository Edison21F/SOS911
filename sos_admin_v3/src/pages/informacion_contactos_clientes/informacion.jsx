/* informacion_contacto_cliente.jsx */
/* -------------------*/
// Importación de bibliotecas y componentes necesarios
import React, { useState, useEffect } from "react";
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx";
import { Search } from "lucide-react";
import InformacionModal from "./informacion_modal.jsx";
import axios from "axios";
import Swal from 'sweetalert2';
import "../../assets/scss/informacion.scss";
import { listarClientes, obtenerCsrfToken, eliminarTodosContactosEmergenciaCliente } from "../../services/clientes";

const BASE_IMG_URL = "/assets/img/";
const DEFAULT_IMG = "con_cliente.jpg";

// Componente para la barra de búsqueda
function Buscador({ busqueda, setBusqueda }) {
  return (
    <div className="input-group" style={{ maxWidth: "400px" }}>
      <input
        type="text"
        className="form-control"
        placeholder="Buscar cliente..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <span className="input-group-text">
        <Search size={18} />
      </span>
    </div>
  );
}

// Componente para mostrar la tarjeta de información de cada cliente
function InformacionCard({ informacion, onFlechaClick, seleccionado, onSelect, eliminado }) {
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
            e.currentTarget.style.transform = "scale(1.04)"; // Zoom más pequeño
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.18)";
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
          src={`${BASE_IMG_URL}${DEFAULT_IMG}`}
          className="card-img-top"
          alt={`Imagen de ${informacion.nombre}`}
          style={{ objectFit: "cover", height: "200px" }}
          loading="lazy"
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
function InformacionContactosClientes() {
  const [busqueda, setBusqueda] = useState("");
  const [informaciones, setInformaciones] = useState([]);
  const [informacionSeleccionada, setInformacionSeleccionada] = useState(null);
  const [clientesSeleccionados, setClientesSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar clientes desde la API
  useEffect(() => {
    const cargarClientes = async () => {
        try {
            setLoading(true);
            await obtenerCsrfToken();
            const clientes = await listarClientes();
            const clientesFormateados = clientes.map(cliente => ({
                id: cliente.id,
                nombre: cliente.nombre,
                eliminado: cliente.estado === 'eliminado'
            }));
            setInformaciones(clientesFormateados);
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
        } finally {
            setLoading(false);
        }
    };
    cargarClientes();
  }, []);

  const informacionesFiltradas = informaciones.filter((informacion) =>
    informacion.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleEliminarInformacion = async () => {
    try {
        const mensaje = clientesSeleccionados.length === 1 
            ? '¿Desea eliminar todos los números de emergencia de este cliente?'
            : `¿Desea eliminar todos los números de emergencia de estos ${clientesSeleccionados.length} clientes?`;
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: mensaje,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#0891b2',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            await obtenerCsrfToken();
            for (const clienteId of clientesSeleccionados) {
                await eliminarTodosContactosEmergenciaCliente(clienteId);
            }
            setClientesSeleccionados([]);
            Swal.fire('Eliminado', 'Los números de emergencia han sido eliminados', 'success');
        }
    } catch (error) {
        console.error('Error al eliminar contactos:', error.response?.data || error.message);
        Swal.fire(
            'Error', 
            error.response?.data?.message || error.response?.data?.error || 'No se pudieron eliminar los contactos',
            'error'
        );
    }
  };

  const handleSeleccionarCliente = (id) => {
    setClientesSeleccionados((prevSeleccionados) =>
      prevSeleccionados.includes(id)
        ? prevSeleccionados.filter((clienteId) => clienteId !== id)
        : [...prevSeleccionados, id]
    );
  };

  return (
    <div>
      <h1 className="page-header">
        Información de Contacto Cliente <small>administración</small>
      </h1>

      <Panel>
        <PanelHeader>
          <h4 className="panel-title">Información de Contacto del Cliente</h4>
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
                disabled={clientesSeleccionados.length === 0}
              >
                <i className="bi bi-trash"></i> Eliminar
              </button>
            </div>
          </div>

          {/* Mostrar estado de carga */}
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-2">Cargando clientes...</p>
            </div>
          ) : informacionesFiltradas.length === 0 ? (
            <div className="text-center p-5">
              <p>No se encontraron clientes.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {informacionesFiltradas.map((informacion) => (
                <InformacionCard
                  key={informacion.id}
                  informacion={informacion}
                  onFlechaClick={setInformacionSeleccionada}
                  seleccionado={clientesSeleccionados.includes(informacion.id)}
                  onSelect={handleSeleccionarCliente}
                  eliminado={informacion.eliminado}
                />
              ))}
            </div>
          )}
        </PanelBody>
      </Panel>

      {informacionSeleccionada && (
        <InformacionModal
          informacion={informacionSeleccionada}
          onClose={() => setInformacionSeleccionada(null)}
        />
      )}
    </div>
  );
}

export default InformacionContactosClientes;
