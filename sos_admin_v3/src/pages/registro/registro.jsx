import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../../assets/scss/registro.scss";
import personImg from "../../assets/img/person.png";
import { registrarUsuario, obtenerCsrfToken } from "../../services/usuarios";

// Importa los iconos que necesites
// Asegúrate de importar FaUser y FaEyeSlash para el "ojito"
import { FaUser, FaIdCard, FaMapMarkerAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCalendarAlt } from "react-icons/fa";

const Registro = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    cedula_identidad: "",
    direccion: "",
    correo_electronico: "",
    contrasena: "",
    fecha_nacimiento: "",
    estado: "activo"
  });

  // NUEVO ESTADO: Para manejar el archivo de imagen seleccionado
  const [selectedFile, setSelectedFile] = useState(null);

  const [csrfToken, setCsrfToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // --- ESTADOS PARA ANIMACIÓN ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    const fetchCsrfToken = async () => {
      try {
        const token = await obtenerCsrfToken();
        setCsrfToken(token);
        console.log('Token CSRF obtenido y establecido:', token);
      } catch (error) {
        console.error("Error al obtener el token CSRF:", error);
        setErrorMessage("Error al cargar el formulario. Intente de nuevo.");
      }
    };
    fetchCsrfToken();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // NUEVA FUNCIÓN: Para manejar la selección de archivos
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Función para animar la salida y volver al login
  const handleNavigateBack = (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del Link si se usa
    setIsExiting(true); // Activa la animación de salida
    setTimeout(() => {
      navigate('/login'); // Navega después de 500ms
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Limpia cualquier mensaje de error previo

    if (!csrfToken) {
      setErrorMessage("Token CSRF no disponible. Recarga la página.");
      return;
    }

    // IMPORTANTE: Crear un objeto FormData para enviar datos y archivos
    // Esto es necesario porque tu backend usa 'express-fileupload'
    const dataToSend = new FormData();
    for (const key in formData) {
      dataToSend.append(key, formData[key]);
    }
    if (selectedFile) {
      // Asegúrate que 'photoUser' coincide con el nombre del campo que espera tu backend en req.files
      dataToSend.append('photoUser', selectedFile);
    }
    // AÑADIDO: Asegurarse de que el CSRF token también se envíe en el cuerpo del FormData
    // El middleware 'csurf' de Express a menudo busca el token en req.body._csrf
    dataToSend.append('_csrf', csrfToken);


    try {
      // Llama a la función de registro con el FormData y el CSRF token
      const response = await registrarUsuario(dataToSend, csrfToken);

      console.log('Respuesta del servidor:', response);

      if (response.message === "Usuario registrado exitosamente.") {
        Swal.fire({
          icon: "success",
          title: "¡Usuario creado!",
          text: "Tu cuenta se creó exitosamente.",
          confirmButtonText: "Ir al login",
          timer: 3000,
          timerProgressBar: true
        }).then(() => {
          handleNavigateBack(e); // Usamos nuestra función para animar la salida
        });
      } else {
        // Muestra el mensaje de error del backend si existe
        setErrorMessage(response.message || "Error al registrar el usuario.");
      }
    } catch (error) {
      console.error("Error completo en el registro:", error);
      console.error("Respuesta del error:", error.response?.data);

      // Intenta obtener el mensaje de error del backend
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Error al conectar con el servidor. Por favor, intente de nuevo más tarde.");
      }
    }
  };

  return (
    <div className={`registro-outer-container ${isLoaded ? 'loaded' : ''} ${isExiting ? 'exiting' : ''}`}>
      <div className="registro-bg"></div>
      <div className="registro-card">
        <div className="left-container">
          <div className="welcome-content">
            <img src="/assets/img/icon.png" alt="Logo SOS911" className="welcome-image" />
            <h1 className="login-title">
              <span className="sos-text">Sos</span>
              <span className="nine-eleven-text">911</span>
            </h1>
            <p className="welcome-text">Un toque para tu seguridad</p>
            <img src={personImg} alt="Persona representativa" className="welcome-person-image" />
          </div>
        </div>

        <div className="right-container">
          <h2 className="titulo">Registro</h2>
          <form onSubmit={handleSubmit}>
            {/* Campo oculto para el CSRF token (no es estrictamente necesario en FormData, pero no molesta) */}
            <input type="hidden" name="_csrf" value={csrfToken} />

            <div className="form-columns">
              <div className="form-group">
                <label className="etiqueta">Nombres *</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon left-icon" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ingresa tus nombres"
                    required
                    className="entrada"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="etiqueta">Cédula *</label>
                <div className="input-with-icon">
                  <FaIdCard className="input-icon left-icon" />
                  <input
                    type="text"
                    name="cedula_identidad"
                    value={formData.cedula_identidad}
                    onChange={handleChange}
                    placeholder="Ingresa tu cédula"
                    required
                    className="entrada"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="etiqueta">Dirección *</label>
                <div className="input-with-icon">
                  <FaMapMarkerAlt className="input-icon left-icon" />
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ingresa tu dirección"
                    required
                    className="entrada"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="etiqueta">Correo Electrónico *</label>
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon left-icon" />
                  <input
                    type="email"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleChange}
                    placeholder="Ingresa tu correo"
                    required
                    className="entrada"
                  />
                </div>
              </div>

              {/* CAMPO DE FECHA DE NACIMIENTO FULL WIDTH */}
              <div className="form-group full-width">
                <label className="etiqueta">Fecha de Nacimiento *</label>
                <div className="input-with-icon">
                  <FaCalendarAlt className="input-icon left-icon" />
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento || ""}
                    onChange={handleChange}
                    required
                    className="entrada"
                    style={{
                      width: "100%",
                      minWidth: "200px",
                      background: "#232b3b",
                      color: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      height: "40px",
                      paddingLeft: "40px"
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="etiqueta">Contraseña *</label>
                <div className="input-with-icon">
                  <FaLock className="input-icon left-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder="Crea una contraseña"
                    required
                    className="entrada password-input"
                  />
                  {showPassword ? (
                    <FaEyeSlash
                      className="input-icon password-toggle-icon"
                      onClick={togglePasswordVisibility}
                    />
                  ) : (
                    <FaEye
                      className="input-icon password-toggle-icon"
                      onClick={togglePasswordVisibility}
                    />
                  )}
                </div>
              </div>
            </div>

            {errorMessage && <p style={{ color: "red", marginTop: "5px" }}>{errorMessage}</p>}

            <div className="checkbox-group">
              <input type="checkbox" required className="checkbox" />
              <p>
                Al hacer clic en Registrarse, acepta nuestros{" "}
                <a href="/terms" className="enlace-terminos">Términos</a> y que ha leído nuestra{" "}
                <a href="/privacy-policy" className="enlace-terminos">Política de datos</a>.
              </p>
            </div>

            <button type="submit" className="boton">Crear Cuenta</button>
          </form>

          <p className="texto-enlace">
            ¿Ya eres miembro?{" "}
            <Link to="/login" className="enlace" onClick={handleNavigateBack}>
                Haz clic aquí para iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registro;
