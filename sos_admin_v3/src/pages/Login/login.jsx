//login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../assets/scss/login.scss";
import Swal from "sweetalert2";
import instance from "../../api/axios";
import { setAuthenticated } from "../../config/auth"; 
import { loginUsuario, obtenerCsrfToken } from "../../services/usuarios";

const BASE_IMG_URL = "./assets/img";

// Función de logout (se mantiene como estaba)
export const logout = (navigate) => {
  localStorage.removeItem("usuario_id");
  navigate("/login");
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Función para obtener el token CSRF
  const fetchCsrfToken = async () => {
    try {
      const response = await instance.get("/csrf-token");
      // Cambia aquí: ahora el token está en response.data.csrfToken
      setCsrfToken(response.data.csrfToken); 
      localStorage.setItem("csrfToken", response.data.csrfToken); 
      return response.data.csrfToken; 
    } catch (error) {
      console.error("Error al obtener el token CSRF:", error);
      Swal.fire({
        icon: "error",
        title: "Error de seguridad",
        text: "No se pudo obtener el token de seguridad. Por favor, recarga la página.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#d33",
      });
      return null;
    }
  };

  // Efecto para obtener el token CSRF al cargar el componente
  useEffect(() => {
    fetchCsrfToken();
  }, []);

  // Función para manejar el envío del formulario de login
  const handleSubmit = async (e, reintento = false) => {
    e.preventDefault && e.preventDefault();
    setError("");
    setIsSubmitting(true);

    console.log("[LOGIN] Intentando iniciar sesión...", reintento ? "(reintento)" : "");

    try {
      // Verifica el token CSRF justo antes de enviar la solicitud
      if (!csrfToken) {
        console.warn("[LOGIN] CSRF token no disponible. Reintentando obtenerlo...");
        const nuevoToken = await obtenerCsrfToken();
        if (!nuevoToken) {
          setError("No se pudo obtener el token de seguridad. Por favor, recarga la página.");
          setIsSubmitting(false);
          return;
        }
        // Si se obtuvo un nuevo token, reintenta la solicitud con el nuevo token
        // Esto es importante para evitar bucles infinitos si fetchCsrfToken no resuelve el problema
        if (!reintento) { // Solo reintentar una vez para evitar bucles
            setCsrfToken(nuevoToken); // Actualiza el estado con el nuevo token
            setTimeout(() => handleSubmit(e, true), 100); // Reenvía la solicitud con el nuevo token
            return;
        } else {
            // Si ya es un reintento y aún no hay token, muestra error
            setError("No se pudo obtener el token de seguridad después de varios intentos. Recarga la página.");
            setIsSubmitting(false);
            return;
        }
      }

      const tokenToSend = csrfToken || localStorage.getItem("csrfToken"); // Usa el token del estado o de localStorage
      const response = await loginUsuario(email, password, tokenToSend);
      console.log("[LOGIN] Respuesta del backend:", response);

      if (response.userId) {
        setAuthenticated(response.userId); 
        localStorage.setItem("usuario_nombre", response.nombre || "usuario"); 
        localStorage.setItem("usuario_email", response.correo_electronico || "");
        localStorage.setItem("show_welcome", "true");

        console.log("[LOGIN] Login exitoso, userId guardado:", response.userId);

        Swal.fire({
          icon: "success",
          title: "¡Inicio de sesión exitoso!",
          html: `<strong class="custom-welcome">Bienvenido, ${response.nombre || "usuario"}.</strong><br>Redirigiendo al panel...`,
          timer: 1500,
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            const content = Swal.getHtmlContainer();
            if (content) {
              content.querySelector("strong")?.classList.add("custom-welcome");
            }
          },
        }).then(() => {
          setIsSubmitting(false);
          navigate("/dashboard", { replace: true });
        });
      } else {
        // Si la respuesta no cumple con la estructura esperada (ej. no hay userId)
        setError("Credenciales inválidas o sesión expirada. Intenta recargar la página.");
        console.warn("[LOGIN] Respuesta inesperada:", response);
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: "Credenciales inválidas o ha ocurrido un error. Intenta recargar la página.",
          confirmButtonText: "Entendido",
          confirmButtonColor: "#d33",
        });
      }
    } catch (err) {
      console.error("[LOGIN] Error en login:", err);
      let msg = "Ha ocurrido un error inesperado.";
      
      // Manejo específico de error CSRF (status 419 o 403 con mensaje de CSRF)
      const isCsrfError = err.response?.status === 419 || (err.response?.status === 403 && err.response?.data?.message?.includes('CSRF token'));
      if (isCsrfError && !reintento) {
        msg = "Token de seguridad inválido. Reintentando automáticamente...";
        console.warn("[LOGIN] Token CSRF inválido, reintentando login tras refrescar CSRF...");
        const nuevoToken = await fetchCsrfToken(); // Intenta obtener un nuevo token
        if (nuevoToken) {
          setCsrfToken(nuevoToken); // Actualiza el estado con el nuevo token
          setTimeout(() => handleSubmit(e, true), 100); // Reenvía la solicitud con el nuevo token
          return; // Sale para evitar que el finally se ejecute y resetea isSubmitting prematuramente
        } else {
            msg = "No se pudo obtener el token de seguridad después de varios intentos. Recarga la página.";
        }
      } else if (err.response?.status === 401) {
        msg = "Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.";
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      }
      setError(msg); // Establece el mensaje de error para mostrar en el componente
      Swal.fire({
        icon: "error",
        title: "Error al iniciar sesión",
        text: msg,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false); // Desactiva el estado de envío al finalizar (éxito o error)
    }
  };

  // Función para manejar la navegación a la página de registro con animación
  const handleNavigate = (e) => {
    e.preventDefault(); 
    setIsExiting(true); // Activa la clase para la animación de salida
    setTimeout(() => {
        navigate('/registro'); // Navega después de la animación
    }, 500); // El tiempo debe coincidir con la duración de la animación en SCSS
  };

  return (
    <div className={`login-container ${isExiting ? 'exiting' : ''}`}>
      <div className="login-content text-center">
        <div className="login-header d-flex flex-column align-items-center mb-4">
          <img
            src={`${BASE_IMG_URL}/icon.png`}
            alt="SOS 911"
            className="login-logo"
          />
          <h1 className="login-title">
            <span className="sos-text">Sos</span>
            <span className="nine-eleven-text">911</span>
          </h1>
        </div>
        <p className="login-subtitle">Un toque para tu seguridad</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="mb-3 position-relative">
            <span className="login-icon">
              <i className="bi bi-person"></i>
            </span>
            <input
              type="email"
              placeholder="Usuario"
              className="form-control login-input ps-5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 position-relative">
            <span className="login-icon">
              <i className="bi bi-lock"></i>
            </span>
            <input
              type="password"
              placeholder="Contraseña"
              className="form-control login-input ps-5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-check text-start mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="remember"
            />
            <label htmlFor="remember" className="form-check-label">
              Recuérdame
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            disabled={!csrfToken || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Iniciando sesión...
              </>
            ) : (
              <>
                Iniciar Sesión
                <i
                  className="bi bi-arrow-right-circle"
                  style={{ fontSize: "1.3rem", color: "#fff" }}
                ></i>
              </>
            )}
          </button>
          {!csrfToken && (
            <div className="alert alert-info mt-2">Cargando seguridad...</div>
          )}

          <p className="login-register-text mt-3">
            ¿Aún no eres miembro? Haz clic{" "}
            <Link to="/registro" className="login-link" onClick={handleNavigate}>
              aquí
            </Link>{" "}
            para registrarte.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
