/* estadisticas.jsx */
/* -------------------*/
import React from "react"; // Importa React para crear componentes
import { Panel, PanelHeader, PanelBody } from "../../components/panel/panel.jsx"; // Importa los componentes de Panel para estructurar la interfaz
import { Bar, Line, Pie } from "react-chartjs-2"; // Importa los gráficos de barras, líneas y pie desde Chart.js
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement,
} from "chart.js"; // Importa módulos específicos de Chart.js para registrar y crear gráficos
import "../../assets/scss/estadisticas.scss"; // Importa los estilos de la página

// Registra los módulos de Chart.js para que estén disponibles al usar los gráficos
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    ArcElement
);
 // Definimos las variables de los datos con un guion bajo al inicio para mayor seguridad
 
const Estadisticas = () => { // Define el componente de la página de estadísticas
    const _datosUsuarios = { // Datos para el gráfico de barras de gestión de usuarios
        labels: ["Administradores", "Clientes"], // Etiquetas de las categorías
        datasets: [
            {
                label: "Cantidad de Usuarios", // Título del gráfico
                data: [10, 40], // Datos de la cantidad de usuarios
                backgroundColor: "rgba(54, 162, 235, 0.6)", // Color de fondo de las barras
            },
        ],
    };

    const _datosRespuestas = { // Datos para el gráfico de líneas de respuestas de usuarios
        labels: ["911", "SOS", "Innecesario"], // Etiquetas de categorías
        datasets: [
            {
                label: "Actividad de Usuarios", // Título del gráfico
                data: [100, 150, 50], // Datos de la actividad
                borderColor: "rgba(255, 99, 132, 1)", // Color de la línea
                fill: false, // No llenar el área bajo la línea
            },
        ],
    };

    const _datosDispositivos = { // Datos para el gráfico de torta (Pie) de dispositivos utilizados
        labels: ["Android", "iOS", "Otros"], // Etiquetas de categorías
        datasets: [
            {
                data: [60, 30, 10], // Datos del porcentaje de dispositivos
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"], // Colores para cada sector
            },
        ],
    };

    const _datosNotificacionesCombinados = { // Datos combinados para gráfico de barras y líneas de notificaciones
        labels: ["Total Notificaciones", "Botón Pulsado", "Clientes Notificados"], // Etiquetas de categorías
        datasets: [
            {
                type: "bar", // Tipo de gráfico: barra
                label: "Notificaciones del Sistema", // Título del gráfico
                data: [1000, 700, 500], // Datos de las notificaciones
                backgroundColor: "rgba(255, 99, 132, 0.6)", // Color de fondo de las barras
            },
            {
                type: "line", // Tipo de gráfico: línea
                label: "Tendencia", // Título de la línea
                data: [1000, 700, 500], // Datos de la tendencia
                borderColor: "rgba(54, 162, 235, 1)", // Color de la línea
                borderWidth: 2, // Grosor de la línea
                fill: false, // No llenar el área bajo la línea
            },
        ],
    };

    const _datosUbicaciones = { // Datos para el gráfico de barras de gestión de ubicaciones
        labels: ["Zona Norte", "Zona Centro", "Zona Sur"], // Etiquetas de las zonas
        datasets: [
            {
                label: "Cantidad de Eventos", // Título del gráfico
                data: [400, 350, 250], // Datos de los eventos por zona
                backgroundColor: "rgb(7, 211, 184)", // Color de fondo de las barras
            },
        ],
    };

    const _datosBotonesEmergencia = { // Datos para el gráfico de torta (Pie) de botones de emergencia
        labels: ["Activados", "No Activados"], // Etiquetas de las categorías
        datasets: [
            {
                label: "Estado de Botones de Emergencia", // Título del gráfico
                data: [120, 80], // Datos de los botones activados y no activados
                backgroundColor: ["#4BC0C0", "#FF9F40"], // Colores para cada sector
            },
        ],
    };

    const _datosClientes = { // Datos para el gráfico de torta (Pie) de estado de clientes
        labels: ["Activos", "Inactivos"], // Etiquetas de las categorías
        datasets: [
            {
                label: "Estado de Clientes", // Título del gráfico
                data: [500, 200], // Datos de los clientes activos e inactivos
                backgroundColor: ["#9966FF", "#FFDD57"], // Colores para cada sector
            },
        ],
    };

    const _datosGrupos = { // Datos para el gráfico de barras de gestión de grupos
        labels: ["Grupo A", "Grupo B", "Grupo C"], // Etiquetas de los grupos
        datasets: [
            {
                label: "Cantidad de Grupos", // Título del gráfico
                data: [5, 8, 3], // Datos de la cantidad de grupos
                backgroundColor: "rgb(29, 165, 228)", // Color de fondo de las barras
            },
        ],
    };

    return (
        <div className="estadisticas-container"> {/* Contenedor principal de la página de estadísticas */}
            <h1 className="page-header">
                Reportes y Estadísticas <small>Estadísticas Generales</small> {/* Título principal de la página */}
            </h1>
            <div className="row"> {/* Fila para organizar los gráficos */}
                <div className="col-md-6"> {/* Columna para el gráfico de gestión de usuarios */}
                    <Panel> {/* Componente Panel */}
                        <PanelHeader>
                            <h4 className="panel-title">Gestión de Usuarios</h4> {/* Título del panel */}
                        </PanelHeader>
                        <PanelBody>
                            <Bar data={_datosUsuarios} /> {/* Gráfico de barras de gestión de usuarios */}
                        </PanelBody>
                    </Panel>
                </div>
                <div className="col-md-6"> {/* Columna para el gráfico de respuestas de usuarios */}
                    <Panel>
                        <PanelHeader>
                            <h4 className="panel-title">Respuestas de Usuarios</h4> {/* Título del panel */}
                        </PanelHeader>
                        <PanelBody>
                            <Line data={_datosRespuestas} /> {/* Gráfico de línea de respuestas */}
                        </PanelBody>
                    </Panel>
                </div>
                <div className="col-md-6 mt-4"> {/* Columna para el gráfico de dispositivos utilizados */}
                    <Panel>
                        <PanelHeader>
                            <h4 className="panel-title">Dispositivos Utilizados</h4> {/* Título del panel */}
                        </PanelHeader>
                        <PanelBody>
                            <Pie data={_datosDispositivos} /> {/* Gráfico de torta de dispositivos */}
                        </PanelBody>
                    </Panel>
                </div>
                <div className="col-md-6 mt-4"> {/* Columna para el gráfico de gestión de notificaciones */}
                    <Panel>
                        <PanelHeader>
                            <h4 className="panel-title">Gestión de Notificaciones</h4> {/* Título del panel */}
                        </PanelHeader>
                        <PanelBody>
                            <Bar data={_datosNotificacionesCombinados} /> {/* Gráfico combinado de notificaciones */}
                        </PanelBody>
                    </Panel>
                </div>
                <div className="col-md-6 mt-4"> {/* Columna para el gráfico de gestión de ubicaciones */}
                    <Panel>
                        <PanelHeader>
                            <h4 className="panel-title">Gestión de Ubicaciones</h4> {/* Título del panel */}
                        </PanelHeader>
                        <PanelBody>
                            <Bar data={_datosUbicaciones} /> {/* Gráfico de barras de ubicaciones */}
                        </PanelBody>
                    </Panel>
                </div>
                <div className="col-md-6 mt-4"> {/* Columna para el gráfico de botones de emergencia */}
                    <Panel>
                        <PanelHeader>
                            <h4 className="panel-title">Botones de Emergencia</h4> {/* Título del panel */}
                        </PanelHeader>
                        <PanelBody>
                            <Pie data={_datosBotonesEmergencia} /> {/* Gráfico de torta de botones de emergencia */}
                        </PanelBody>
                    </Panel>
                </div>
                <div className="col-md-6 mt-4"> {/* Columna para el gráfico de estado de clientes */}
                    <Panel>
                        <PanelHeader>
                            <h4 className="panel-title">Clientes</h4> {/* Título del panel */}
                        </PanelHeader>
                        <PanelBody>
                            <Pie data={_datosClientes} /> {/* Gráfico de torta de estado de clientes */}
                        </PanelBody>
                    </Panel>
                </div>
                <div className="col-md-6 mt-4"> {/* Columna para el gráfico de gestión de grupos */}
                    <Panel>
                        <PanelHeader>
                            <h4 className="panel-title">Grupos</h4> {/* Título del panel */}
                        </PanelHeader>
                        <PanelBody>
                            <Bar data={_datosGrupos} /> {/* Gráfico de barras de grupos */}
                        </PanelBody>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default Estadisticas; // Exporta el componente para usarlo en otras partes del proyecto
