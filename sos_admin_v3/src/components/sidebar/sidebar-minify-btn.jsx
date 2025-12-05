import React, { useContext, useEffect, useState } from 'react';
import { AppSettings } from './../../config/app-settings.js';
import Swal from 'sweetalert2'; // Importar SweetAlert2

function SidebarMinifyBtn() {
	const context = useContext(AppSettings);
	const [usuarioId, setUsuarioId] = useState(null); // Estado para almacenar el usuarioId

    // Obtener usuarioId del localStorage al montar el componente
    useEffect(() => {
        const id = localStorage.getItem("usuario_id");
        if (id) {
            setUsuarioId(id);
        }
    }, []);

	const handleMinify = async (event) => {
		event.preventDefault();
		// newAppSidebarMinifyState será el nuevo estado de 'IS_OPEN' en el frontend
		// Si appSidebarMinify es true (abierta), newAppSidebarMinifyState será false (encogida)
		// Si appSidebarMinify es false (encogida), newAppSidebarMinifyState será true (abierta)
		const newAppSidebarMinifyState = !context.appSidebarMinify; 
		
		// Cambia el estado visual inmediatamente (IS_OPEN)
		context.toggleAppSidebarMinify();

		if (!usuarioId) {
            console.warn("Usuario no identificado para guardar preferencias.");
            return;
        }

        try {
            // Guarda en el backend: sidebarMinimizado (IS_MINIFIED) debe ser lo opuesto a newAppSidebarMinifyState (IS_OPEN)
            // Si newAppSidebarMinifyState es true (abierta), enviamos false (no minificada) al backend.
            // Si newAppSidebarMinifyState es false (encogida), enviamos true (minificada) al backend.
            await context.guardarPreferenciasUsuario(
                usuarioId,
                context.appDarkMode ? 'oscuro' : 'claro', // Tema actual
                !newAppSidebarMinifyState // Invertir para enviar el valor de IS_MINIFIED al backend
            );
            console.log("Preferencia de minimización de sidebar actualizada.");
        } catch (error) {
            console.error("Error al guardar preferencia de minimización de sidebar:", error.response?.data?.message || error.message);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar la preferencia de minimización del sidebar.",
            });
            // Revertir el estado del toggle si la API falla
            context.toggleAppSidebarMinify(); 
        }
	};

	return (
		<div className="menu">
			<div className="menu-item d-flex">
				<button type="button" className="app-sidebar-minify-btn ms-auto" onClick={handleMinify}>
					<i className="fa fa-angle-double-left"></i>
				</button>
			</div>
		</div>
	)
}

export default SidebarMinifyBtn;
