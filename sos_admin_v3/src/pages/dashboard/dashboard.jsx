/* dashboard.jsx */
/* -------------------*/
import React, { useState, useRef, useEffect } from 'react';
import { Panel, PanelHeader, PanelBody } from './../../components/panel/panel.jsx';
import { Edit2, Save, Smartphone, Monitor, Upload, ArrowRight, ArrowLeft } from 'lucide-react'; // Importar ArrowRight y ArrowLeft
import '../../assets/scss/dashboard.scss';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
// Importar las funciones de la API
import {
    obtenerCsrfToken,
    obtenerContenidoApp,
    crearContenidoApp,
    actualizarContenidoApp,
    obtenerContenidoPagina,
    crearContenidoPagina,
    actualizarContenidoPagina
} from '../../services/dashboard.js'; // Ajusta la ruta si es necesario

// Componente de texto editable
const EditableText = ({ text, onSave, editing, style = {}, className = '' }) => {
    const [value, setValue] = useState(text); // Inicialización del estado para el texto editable

    const handleBlur = () => { // Función que se llama cuando el campo de texto pierde el enfoque
        onSave(value); // Guarda el valor actual del texto
    };

    if (!editing) { // Si no estamos en modo edición
        return <span style={style} className={className}>{text}</span>; // Muestra el texto sin editar
    }

    return (
        <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)} // Actualiza el valor del texto al cambiar
            onBlur={handleBlur} // Llama a la función de guardar al perder el enfoque
            className={`form-control bg-transparent border-0 text-center ${className}`}
            style={{
                ...style,
                cursor: 'text',
                outline: '1px dashed rgba(255,255,255,0.5)'
            }}
        />
    );
};
// Componente para editar texto en un textarea
const EditableTextArea = ({ text, onSave, editing, style = {} }) => {
    const [value, setValue] = useState(text);

    const handleBlur = () => {
        onSave(value);
    };

    if (!editing) {
        return <p style={style} className="mb-4">{text}</p>;
    }

    return (
        <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            className="form-control bg-transparent border-0 text-center"
            style={{
                ...style,
                height: 'auto',
                minHeight: '150px',
                resize: 'none',
                cursor: 'text',
                outline: '1px dashed rgba(0,0,0,0.2)'
            }}
        />
    );
};
// Componente para subir imágenes
const ImageUploader = ({ currentImage, onImageChange, editing }) => {
    const fileInputRef = useRef(null);

    const handleImageClick = () => {
        if (editing) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                onImageChange(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="position-relative d-inline-block">
            <img
                src={currentImage}
                alt="App Icon"
                className="mb-2"
                style={{
                    width: '60px',
                    height: '60px',
                    cursor: editing ? 'pointer' : 'default',
                    opacity: editing ? 0.8 : 1
                }}
                onClick={handleImageClick}
            />
            {editing && (
                <>
                    <div
                        className="position-absolute top-50 start-50 translate-middle"
                        style={{ pointerEvents: 'none' }}
                    >
                        <Upload size={24} className="text-dark opacity-75" />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="d-none"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </>
            )}
        </div>
    );
};
// Componente de edición de contenido y diseño
const AppContentEditor = ({ values, onChange, onSave, onNavigateToPageEditor }) => {
    return (
        <div style={{ minWidth: 0, maxWidth: 400, width: '100%' }}>
            <h4 className="mb-3">Editor de Contenido Móvil</h4>
            <div className="mb-3">
                <label className="form-label">Color del Degradado (Inicio)</label>
                <input type="color" className="form-control form-control-color" value={values.gradientStart} onChange={e => onChange('gradientStart', e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Color del Degradado (Fin)</label>
                <input type="color" className="form-control form-control-color" value={values.gradientEnd} onChange={e => onChange('gradientEnd', e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Tipo de Letra</label>
                <select className="form-select" value={values.fontFamily} onChange={e => onChange('fontFamily', e.target.value)}>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Arial">Arial</option>
                </select>
            </div>
            <div className="mb-3">
                <label className="form-label">Título Principal</label>
                <input className="form-control" value={values.mainTitle} onChange={e => onChange('mainTitle', e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Título: Cómo Funciona</label>
                <input className="form-control" value={values.howTitle} onChange={e => onChange('howTitle', e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Contenido: Cómo Funciona</label>
                <textarea className="form-control" rows={2} value={values.howContent} onChange={e => onChange('howContent', e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Título: Nuestra Misión</label>
                <input className="form-control" value={values.missionTitle} onChange={e => onChange('missionTitle', e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Contenido: Nuestra Misión</label>
                <textarea className="form-control" rows={2} value={values.missionContent} onChange={e => onChange('missionContent', e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Título: Nuestra Visión</label>
                <input className="form-control" value={values.visionTitle} onChange={e => onChange('visionTitle', e.target.value)} />
            </div>
            <div className="mb-3">
                <label className="form-label">Contenido: Nuestra Visión</label>
                <textarea className="form-control" rows={2} value={values.visionContent} onChange={e => onChange('visionContent', e.target.value)} />
            </div>
            <div className="d-flex justify-content-between align-items-center">
               <button 
    className="btn btn-primary px-4 d-flex align-items-center gap-2 rounded-pill shadow-sm" 
    type="button" 
    onClick={onSave}
    style={{ backgroundColor: '#0891b2', borderColor: '#0891b2', fontSize: '0.9rem', fontWeight: '500' }}
>
    <Save size={18} className="me-2" /> Guardar
</button>
                <button 
                    className="btn btn-success px-4 d-flex align-items-center gap-2 rounded-pill shadow-sm" 
                    type="button" 
                    onClick={onNavigateToPageEditor}
                    style={{ backgroundColor: '#6c757d', borderColor: '#6c757d', fontSize: '0.9rem', fontWeight: '500' }} // Mantener estilos de fuente si son específicos
                >
                    Ir a Editor de Página <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
};

// Modifico AppContent para que use los valores editables
const AppContent = ({ values }) => {
    return (
        <div
            className="sos-bg d-flex flex-column align-items-start justify-content-start"
            style={{
                height: '100%',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                padding: 0,
                background: `linear-gradient(180deg, ${values.gradientStart} 0%, ${values.gradientEnd} 100%)`,
                fontFamily: values.fontFamily
            }}
        >
            {/* Header tipo celular */}
            <div
                style={{
                    width: '100%',
                    background: 'rgb(0, 140, 165)',
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 14px',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    fontSize: 14
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', color: '#fff', fontWeight: 500 }}>
                    <span style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        background: '#fff',
                        borderRadius: '50%',
                        marginRight: 5
                    }}></span>
                    9:41
                </div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
                    SOS 911
                </div>
            </div>
            {/* Contenido scrollable */}
            <div style={{ width: '100%', flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
                <div style={{ padding: '22px 0 0 0' }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 16, textAlign: 'center', width: '100%' }}>
                        {values.mainTitle}
                    </div>
                    <div style={{
                        width: 44,
                        height: 3,
                        background: '#38bdf8',
                        borderRadius: 2,
                        margin: '8px auto 0 auto',
                        opacity: 0.7
                    }} />
                </div>
                <div style={{ width: '100%', marginTop: 18, padding: '0 2px' }}>
                    {/* Cómo Funciona */}
                    <div style={{
                        background: 'rgba(45, 53, 60, 0.6)',
                        borderRadius: 16,
                        padding: '13px 13px 10px 13px',
                        marginBottom: 13,
                        color: '#f8fafc',
                        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.13)',
                        border: '1px solid rgba(100, 116, 139, 0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{
                                background: 'rgba(56, 189, 248, 0.15)',
                                padding: 6,
                                borderRadius: 10,
                                marginRight: 10
                            }}>
                                <svg width="18" height="18" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M9 12l2 2l4-4" />
                                </svg>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{values.howTitle}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: '19px' }}>
                            {values.howContent}
                        </div>
                    </div>
                    {/* Nuestra Misión */}
                    <div style={{
                        background: 'rgba(45, 53, 60, 0.6)',
                        borderRadius: 16,
                        padding: '13px 13px 10px 13px',
                        marginBottom: 13,
                        color: '#f8fafc',
                        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.13)',
                        border: '1px solid rgba(100, 116, 139, 0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{
                                background: 'rgba(45, 212, 191, 0.15)',
                                padding: 6,
                                borderRadius: 10,
                                marginRight: 10
                            }}>
                                <svg width="18" height="18" fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M12 21C12 21 4 13.5 4 8.5C4 5.42 6.42 3 9.5 3C11.24 3 12.91 3.81 14 5.08C15.09 3.81 16.76 3 18.5 3C21.58 3 24 5.42 24 8.5C24 13.5 16 21 16 21H12Z" />
                                </svg>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{values.missionTitle}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: '19px' }}>
                            {values.missionContent}
                        </div>
                    </div>
                    {/* Nuestra Visión */}
                    <div style={{
                        background: 'rgba(45, 53, 60, 0.6)',
                        borderRadius: 16,
                        padding: '13px 13px 10px 13px',
                        marginBottom: 13,
                        color: '#f8fafc',
                        boxShadow: '0 4px 16px 0 rgba(0,0,0,0.13)',
                        border: '1px solid rgba(100, 116, 139, 0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <div style={{
                                background: 'rgba(167, 139, 250, 0.15)',
                                padding: 6,
                                borderRadius: 10,
                                marginRight: 10
                            }}>
                                {/* Icono de ojo (eye) */}
                                <svg width="18" height="18" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <ellipse cx="12" cy="12" rx="9" ry="5" />
                                    <circle cx="12" cy="12" r="2.5" />
                                </svg>
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 15 }}>{values.visionTitle}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: '19px' }}>
                            {values.visionContent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modifico AppPreview para agregar animación al pasar el mouse
const AppPreview = ({ values }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div
                className="bg-dark rounded-5 p-3 preview-animable"
                style={{
                    maxWidth: '340px',
                    width: '100%',
                    transition: 'transform 0.35s cubic-bezier(.4,2,.6,1), box-shadow 0.35s',
                    boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)'
                }}
            >
                <div
                    className="bg-white rounded-4 overflow-hidden"
                    style={{
                        height: '600px',
                        background: 'transparent',
                        boxShadow: 'none'
                    }}
                >
                    <AppContent values={values} />
                </div>
            </div>
        </div>
    );
};

// Componente para editar el contenido de la página principal (integrado en Dashboard)
const PageContentEditor = ({ onBack }) => {
    const [pageValues, setPageValues] = useState({
        id: null, // Para almacenar el ID de la página si ya existe
        nombrePagina: '',
        descripcionPagina: '',
        mision: '',
        vision: '',
        logoUrl: 'https://placehold.co/150x50/cccccc/ffffff?text=LogoApp' // Valor por defecto
    });
    const [loadingPageContent, setLoadingPageContent] = useState(true); // Estado de carga específico para la página
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchPageContent = async () => {
            const csrfToken = localStorage.getItem("csrfToken");
            if (!csrfToken) {
                Swal.fire({
                    icon: "error",
                    title: "Error de seguridad",
                    text: "Token CSRF no disponible. Recargue la página.",
                });
                setLoadingPageContent(false);
                return;
            }

            try {
                // Intentar obtener la configuración de la página (asumiendo una única configuración)
                const data = await obtenerContenidoPagina();

                if (data) {
                    setPageValues({
                        id: data.id,
                        nombrePagina: data.nombrePagina || '',
                        descripcionPagina: data.descripcionPagina || '',
                        mision: data.mision || '',
                        vision: data.vision || '',
                        logoUrl: data.logoUrl || 'https://placehold.co/150x50/cccccc/ffffff?text=LogoApp'
                    });
                }
                setLoadingPageContent(false);
            } catch (error) {
                console.error("Error al obtener el contenido de la página:", error.response?.data?.message || error.message);
                // Si el contenido no se encuentra (404) o hay un error, inicializar con valores por defecto
                if (error.response && error.response.status === 404 || (error.response && error.response.status === 500 && error.response.data.error === 'Configuración de página no encontrada.')) {
                    console.info("No se encontró contenido de página. Se inicializará con valores por defecto.");
                    setPageValues(prev => ({
                        ...prev,
                        id: null, // Asegurarse de que el ID sea nulo para indicar que es una nueva creación
                        nombrePagina: 'Página Principal',
                        descripcionPagina: 'Bienvenido a nuestra aplicación.',
                        mision: 'Nuestra misión es...',
                        vision: 'Nuestra visión es...',
                        logoUrl: 'https://placehold.co/150x50/cccccc/ffffff?text=LogoApp'
                    }));
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "No se pudo cargar el contenido de la página.",
                    });
                }
                setLoadingPageContent(false);
            }
        };

        fetchPageContent();
    }, []);

    const handleChange = (property, value) => {
        setPageValues(prev => ({
            ...prev,
            [property]: value
        }));
    };

    const handleImageChange = (base64Image) => {
        setPageValues(prev => ({
            ...prev,
            logoUrl: base64Image
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                handleImageChange(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePageContent = async () => {
        const csrfToken = localStorage.getItem("csrfToken");
        if (!csrfToken) {
            Swal.fire({
                icon: "error",
                title: "Error de seguridad",
                text: "Token CSRF no disponible. Recargue la página.",
            });
            return;
        }

        const body = {
            nombrePagina: pageValues.nombrePagina,
            descripcionPagina: pageValues.descripcionPagina,
            mision: pageValues.mision,
            vision: pageValues.vision,
            logoUrl: pageValues.logoUrl,
            estado: 'activo' // Asumiendo que siempre se guarda como activo desde aquí
        };

        try {
            let res;
            if (pageValues.id) {
                // Si la página ya existe, actualizarla
                res = await actualizarContenidoPagina(pageValues.id, body);
            } else {
                // Si la página no existe, crearla
                res = await crearContenidoPagina(body);
                // Si es una creación exitosa, actualiza el ID local
                if (res && res.id) {
                    setPageValues(prev => ({ ...prev, id: res.id }));
                }
            }

            Swal.fire({
                icon: 'success',
                title: '¡Cambios guardados!',
                text: 'El contenido de la página ha sido actualizado correctamente.',
                confirmButtonColor: '#13b0a7',
                confirmButtonText: 'OK'
            });
        } catch (err) {
            console.error("Error al guardar el contenido de la página:", err.response?.data?.message || err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'No se pudo guardar el contenido de la página.',
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    };

    if (loadingPageContent) return <div className="text-center py-5">Cargando contenido de la página...</div>;

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg" style={{ minWidth: 0, maxWidth: 400, width: '100%', border: '1px solid #e0e0e0' }}>
            <h4 className="mb-4 text-center text-gray-800 font-bold">Contenido de Página</h4>
            
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <button 
                    className="btn btn-outline-secondary px-3 d-flex align-items-center gap-2 rounded-pill shadow-sm" 
                    type="button" 
                    onClick={onBack}
                    style={{ fontSize: '0.9rem', fontWeight: '500' }}
                >
                    <ArrowLeft size={16} /> Volver a Editor App
                </button>
                <button 
                    className="btn btn-primary px-4 rounded-pill shadow-sm" 
                    type="button" 
                    onClick={handleSavePageContent}
                    style={{ backgroundColor: '#0891b2', borderColor: '#0891b2', fontSize: '0.9rem', fontWeight: '500' }}
                >
                    <Save size={16} className="me-2" /> Guardar
                </button>
            </div>

            <div className="mb-4 text-center">
                <label className="form-label text-gray-700 font-semibold mb-2">Logo de la Página</label>
                <div 
                    className="position-relative d-inline-block p-2 border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                    style={{ borderColor: '#e0e0e0' }}
                >
                    <img
                        src={pageValues.logoUrl}
                        alt="Logo de la Página"
                        className="rounded"
                        style={{
                            width: '150px',
                            height: '50px',
                            objectFit: 'contain',
                            cursor: 'pointer',
                        }}
                        onClick={() => fileInputRef.current.click()}
                    />
                    <div
                        className="position-absolute top-50 start-50 translate-middle"
                        style={{ pointerEvents: 'none' }}
                    >
                        <Upload size={24} className="text-gray-500 opacity-75" />
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="d-none"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label text-gray-700 font-semibold mb-1">Nombre de la Página</label>
                <input 
                    className="form-control rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition ease-in-out duration-150" 
                    value={pageValues.nombrePagina} 
                    onChange={e => handleChange('nombrePagina', e.target.value)} 
                    style={{ padding: '0.75rem 1rem' }}
                />
            </div>
            <div className="mb-3">
                <label className="form-label text-gray-700 font-semibold mb-1">Descripción de la Página</label>
                <textarea 
                    className="form-control rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition ease-in-out duration-150" 
                    rows={3} 
                    value={pageValues.descripcionPagina} 
                    onChange={e => handleChange('descripcionPagina', e.target.value)} 
                    style={{ padding: '0.75rem 1rem' }}
                />
            </div>
            <div className="mb-3">
                <label className="form-label text-gray-700 font-semibold mb-1">Misión</label>
                <textarea 
                    className="form-control rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition ease-in-out duration-150" 
                    rows={3} 
                    value={pageValues.mision} 
                    onChange={e => handleChange('mision', e.target.value)} 
                    style={{ padding: '0.75rem 1rem' }}
                />
            </div>
            <div className="mb-3">
                <label className="form-label text-gray-700 font-semibold mb-1">Visión</label>
                <textarea 
                    className="form-control rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition ease-in-out duration-150" 
                    rows={3} 
                    value={pageValues.vision} 
                    onChange={e => handleChange('vision', e.target.value)} 
                    style={{ padding: '0.75rem 1rem' }}
                />
            </div>
        </div>
    );
};


// Componente principal del dashboard
const Dashboard = () => {
    const [editing, setEditing] = useState(false);
    const [mobileView, setMobileView] = useState(true);
    const [editorValues, setEditorValues] = useState({
        gradientStart: '#026b6b',
        gradientEnd: '#2D353C',
        fontFamily: 'Open Sans',
        mainTitle: 'Un toque para tu seguridad',
        howTitle: 'Cómo Funciona',
        howContent: '',
        missionTitle: 'Nuestra Misión',
        missionContent: '',
        visionTitle: 'Nuestra Visión',
        visionContent: ''
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const csrfFetched = useRef(false); // Para evitar pedir el token varias veces
    const [currentEditor, setCurrentEditor] = useState('appContent'); // 'appContent' o 'pageContent'

    useEffect(() => {
        const fetchContent = async () => {
            if (!csrfFetched.current) {
                try {
                    await obtenerCsrfToken();
                    csrfFetched.current = true;
                } catch (error) {
                    console.error("Error al obtener el token CSRF:", error.message);
                    Swal.fire({
                        icon: "error",
                        title: "Error al cargar token CSRF",
                        text: "Hubo un error al obtener el token de seguridad. Por favor, inténtelo de nuevo.",
                    });
                    setLoading(false);
                    return;
                }
            }

            try {
                const data = await obtenerContenidoApp();

                setEditorValues({
                    gradientStart: data.gradientStart || '#026b6b',
                    gradientEnd: data.gradientEnd || '#2D353C',
                    fontFamily: data.fontFamily || 'Open Sans',
                    mainTitle: data.mainTitle || 'Un toque para tu seguridad',
                    howTitle: data.howItWorksTitle || 'Cómo Funciona',
                    howContent: data.howItWorksContent || '',
                    missionTitle: data.missionTitle || 'Nuestra Misión',
                    missionContent: data.missionContent || '',
                    visionTitle: data.visionTitle || 'Nuestra Visión',
                    visionContent: data.visionContent || ''
                });
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener el contenido de la app:", error.response?.data?.message || error.message);
                // Si el contenido no se encuentra, intentar crearlo con valores por defecto
                if (error.response && error.response.status === 404 || (error.response && error.response.status === 500 && error.response.data.message === 'Contenido no encontrado para actualizar. Considere usar POST /crear primero.')) {
                    try {
                        await crearContenidoApp({
                            gradientStart: '#026b6b',
                            gradientEnd: '#2D353C',
                            fontFamily: 'Open Sans',
                            mainTitle: 'Un toque para tu seguridad',
                            howItWorksKey: 'howItWorks',
                            howItWorksTitle: 'Cómo Funciona',
                            howItWorksContent: 'Contenido por defecto de cómo funciona.',
                            missionKey: 'mission',
                            missionTitle: 'Misión',
                            missionContent: 'Contenido por defecto de misión.',
                            visionKey: 'vision',
                            visionTitle: 'Visión',
                            visionContent: 'Contenido por defecto de visión.',
                            logoApp: 'https://placehold.co/150x50/cccccc/ffffff?text=LogoApp',
                            estado: 'activo'
                        });
                        // Una vez creado, intentar obtenerlo de nuevo
                        fetchContent(); 
                    } catch (createError) {
                        console.error("Error al crear contenido por defecto:", createError.response?.data?.message || createError.message);
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "No se pudo inicializar el contenido de la aplicación.",
                        });
                        setLoading(false);
                    }
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "No se pudo cargar el contenido de la aplicación.",
                    });
                    setLoading(false);
                }
            }
        };

        fetchContent();

        // Mostrar alerta de bienvenida si es un login reciente
        const usuarioNombre = localStorage.getItem("usuario_nombre");
        const showWelcome = localStorage.getItem("show_welcome");
        
        if (showWelcome === "true" && usuarioNombre) {
            localStorage.removeItem("show_welcome");
            setTimeout(() => {
                Swal.fire({
                    icon: "success",
                    title: "¡Bienvenido al Panel!",
                    html: `<div style="text-align: center; padding: 10px;">
                             <div style="margin-bottom: 15px;">
                               <i class="bi bi-person-check-fill" style="font-size: 2.5rem; color: #28a745;"></i>
                             </div>
                             <div style="margin-bottom: 10px;">
                               <span style="color: #6c757d; font-size: 0.95em; display: block;">Iniciaste sesión como</span>
                             </div>
                             <div style="margin-bottom: 15px;">
                               <strong style="color: #007bff; font-size: 1.1em; display: block; background: rgba(0, 123, 255, 0.1); padding: 8px 15px; border-radius: 20px; margin: 0 auto; display: inline-block;">${usuarioNombre}</strong>
                             </div>
                             <div>
                               <small style="color: #28a745; font-size: 0.85em;">
                                 <i class="bi bi-check-circle"></i> Sesión iniciada correctamente
                               </small>
                             </div>
                           </div>`,
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    customClass: {
                        popup: 'custom-success-popup',
                        title: 'custom-success-title',
                        htmlContainer: 'custom-success-content'
                    }
                });
            }, 500);
        }
    }, []);

    const handleEditorChange = (property, value) => {
        setEditorValues(prev => ({
            ...prev,
            [property]: value
        }));
    };

    const handleSave = async () => {
        const csrfToken = localStorage.getItem("csrfToken");
        if (!csrfToken) {
            Swal.fire({
                icon: "error",
                title: "Error de seguridad",
                text: "Token CSRF no disponible. Recargue la página.",
            });
            return;
        }

        const body = {
            gradientStart: editorValues.gradientStart,
            gradientEnd: editorValues.gradientEnd,
            fontFamily: editorValues.fontFamily,
            mainTitle: editorValues.mainTitle,
            howItWorksTitle: editorValues.howTitle,
            howItWorksContent: editorValues.howContent,
            missionTitle: editorValues.missionTitle,
            missionContent: editorValues.missionContent,
            visionTitle: editorValues.visionTitle,
            visionContent: editorValues.visionContent,
        };

        try {
            await actualizarContenidoApp(body);
            Swal.fire({
                icon: 'success',
                title: '¡Cambios realizados!',
                text: 'Cambios realizados a tu app correctamente',
                confirmButtonColor: '#13b0a7',
                confirmButtonText: 'OK'
            });
        } catch (err) {
            console.error("Error al guardar el contenido:", err.response?.data?.message || err.message);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.response?.data?.message || 'No se pudo guardar el contenido',
                confirmButtonColor: '#d33',
                confirmButtonText: 'OK'
            });
        }
    };

    if (loading) return <div className="text-center py-5">Cargando...</div>;

    return (
        <div>
            <h1 className="page-header mb-4">
                Dashboard <small>Editor de Diseño de App</small>
            </h1>
            <div className="row">
                <div className="col-12">
                    <Panel>
                        <PanelHeader>
                            <div className="d-flex justify-content-between align-items-center">
                                <span>Preview de la App</span>
                            </div>
                        </PanelHeader>
                        <PanelBody className="py-4">
                            <div className="preview-app-container d-flex justify-content-center align-items-start gap-4 flex-wrap">
                                {/* Contenido del editor actual o del nuevo editor de página */}
                                {currentEditor === 'appContent' ? (
                                    <>
                                        <AppPreview values={editorValues} />
                                        <AppContentEditor 
                                            values={editorValues} 
                                            onChange={handleEditorChange} 
                                            onSave={handleSave} 
                                            onNavigateToPageEditor={() => setCurrentEditor('pageContent')} 
                                        />
                                    </>
                                ) : (
                                    <PageContentEditor onBack={() => setCurrentEditor('appContent')} />
                                )}
                            </div>
                        </PanelBody>
                    </Panel>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;