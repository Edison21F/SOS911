import React, { useContext, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { AppSettings } from "../../config/app-settings.js";
import { slideToggle } from "../../composables/slideToggle.js";
import { logout } from "../../config/auth";
import Swal from "sweetalert2"; // Importar SweetAlert2

function SidebarProfile() {
  const context = useContext(AppSettings);
  const [usuarioId, setUsuarioId] = useState(null); // Estado para almacenar el usuarioId

  // Obtener usuarioId del localStorage al montar el componente
  useEffect(() => {
    const id = localStorage.getItem("usuario_id");
    if (id) {
      setUsuarioId(id);
    }
  }, []);

  // handleProfileExpand se mantiene igual
  function handleProfileExpand(e) {
    e.preventDefault();

    var targetSidebar = document.querySelector(".app-sidebar:not(.app-sidebar-end)");
    var targetMenu = e.target.closest(".menu-profile");
    var targetProfile = document.querySelector("#appSidebarProfileMenu");
    var expandTime = targetSidebar && targetSidebar.getAttribute("data-disable-slide-animation") ? 0 : 250;

    if (targetProfile) {
      if (targetProfile.style.display === "block") {
        targetMenu.classList.remove("active");
      } else {
        targetMenu.classList.add("active");
      }
      slideToggle(targetProfile, expandTime);
      targetProfile.classList.toggle("expand");
    }
  }

  // handleDarkMode ahora llama a la función centralizada en App.jsx
  async function handleDarkMode(e) {
    const isDarkMode = e.target.checked;
    context.handleSetAppDarkMode(isDarkMode); // Actualiza el estado global de la aplicación inmediatamente

    if (!usuarioId) {
      console.warn("Usuario no identificado para guardar preferencias.");
      return;
    }

    try {
      // Llama a la función centralizada para guardar preferencias
      await context.guardarPreferenciasUsuario(
        usuarioId,
        isDarkMode ? 'oscuro' : 'claro',
        context.appSidebarMinify // Envía también el estado actual del sidebar
      );
      console.log("Preferencia de modo oscuro actualizada.");
    } catch (error) {
      console.error("Error al guardar preferencia de modo oscuro:", error.response?.data?.message || error.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la preferencia del modo oscuro.",
      });
      // Revertir el estado del toggle si la API falla
      context.handleSetAppDarkMode(!isDarkMode);
    }
  }

  function handleLogout() {
    logout(context.navigate); // Usar navigate del contexto si está disponible, o pasarlo como prop
  }

  return (
    <AppSettings.Consumer>
      {({ appSidebarMinify, appDarkMode }) => (
        <div className="menu">
          <div className="menu-profile">
            <a href="/" onClick={handleProfileExpand} className="menu-profile-link">
              <div className="menu-profile-cover with-shadow"></div>
              <div className="menu-profile-image menu-profile-image-icon bg-gray-900 text-gray-600">
                <i className="fa fa-user"></i>
              </div>
              <div className="menu-profile-info">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">Bienvenido</div>
                  <div className="menu-caret ms-auto"></div>
                </div>
                <small></small>
              </div>
            </a>
          </div>
          <div id="appSidebarProfileMenu" className="collapse">
            <div className="menu-item">
              <a href="/perfil" className="menu-link">
                <div className="menu-icon">
                  <i className="fa fa-user"></i>
                </div>
                <div className="menu-text">Perfil</div>
              </a>
            </div>

            <div className="menu-item pt-5px">
              <div className="menu-link">
                <div className="menu-icon">
                  <i className="fa fa-moon"></i>
                </div>
                <div className="menu-text">Modo Oscuro</div>
                <div className="form-check form-switch ms-auto">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    name="app-theme-dark-mode"
                    onChange={handleDarkMode}
                    id="sidebarDarkMode"
                    checked={appDarkMode}
                    value="1"
                  />
                </div>
              </div>
            </div>

            <div className="menu-divider m-0"></div>

            <div className="menu-item pt-5px">
              <button
                type="button"
                className="menu-link border-0 bg-transparent"
                onClick={handleLogout}
              >
                <div className="menu-icon">
                  <LogOut size={18} aria-hidden="true" />
                </div>
                <div className="menu-text">Cerrar Sesión</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppSettings.Consumer>
  );
}

export default SidebarProfile;
