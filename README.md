# Back SOS911

## 📋 Idea del Proyecto
**SOS911** es una plataforma integral de respuesta a emergencias diseñada para conectar a usuarios en situaciones críticas con servicios de emergencia y contactos de confianza. El backend (`back_sos911`) actúa como el núcleo del sistema, gestionando la lógica de negocio, autenticación segura, procesamiento de alertas en tiempo real y almacenamiento de datos críticos.

### Funcionalidades Principales
*   **Botón de Pánico**: Recepción y procesamiento inmediato de alertas de emergencia.
*   **Geolocalización**: Rastreo y almacenamiento de ubicaciones de usuarios y clientes.
*   **Gestión de Usuarios**: Registro, autenticación y perfiles de usuario.
*   **Red de Seguridad**: Administración de contactos de emergencia y grupos familiares/vecinales.
*   **Notificaciones**: Sistema de envío de alertas a dispositivos y contactos vinculados.

## 🏗 Arquitectura
Este proyecto ha sido reestructurado siguiendo principios de **Clean Architecture** y **Domain-Driven Design (DDD)** para garantizar mantenibilidad y escalabilidad.

### Estructura de Carpetas
```text
src/
├── application/       # Casos de uso y orquestación de servicios
├── domain/            # Lógica de negocio pura y modelos (Mongoose)
├── infrastructure/    # Implementación técnica (BD, HTTP, Logs)
│   ├── database/      # Conexiones (SQL/Mongo) y modelos ORM
│   ├── http/          # Controladores y rutas (API)
│   ├── lib/           # Librerías y helpers (Auth, Cifrado)
│   └── logs/          # Registros del sistema
└── config/            # Configuración (keys.js, env)
root/
├── app.js             # Configuración de Express
└── index.js           # Punto de entrada del servidor
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
*   Node.js (v14+ recomendado)
*   MySQL
*   MongoDB

### Pasos
1.  **Clonar el repositorio**
2.  **Instalar dependencias**:
    ```bash
    npm install
    ```
3.  **Configuración**:
    Asegúrate de tener configurarado `src/config/keys.js` o las variables de entorno para las conexiones a base de datos.
4.  **Ejecutar en desarrollo**:
    ```bash
    npm run dev
    ```
    El servidor iniciará por defecto en `http://localhost:3000`.

## 🧪 Documentación para Pruebas (API Endpoints)

Puedes probar estos endpoints utilizando herramientas como **Postman**, **Insomnia** o **cURL**.

> **Nota**: La mayoría de los endpoints requieren autenticación. El sistema usa sesiones, por lo que las pruebas deben manejar cookies o realizarse tras un login exitoso en la misma sesión de cliente.

### 🔐 Autenticación
| Método | Endpoint | Descripción | Body (JSON) |
| :--- | :--- | :--- | :--- |
| `POST` | `/usuarios/login` | Iniciar sesión de usuario | `{ "usuario": "user", "password": "123" }` |
| `POST` | `/usuarios/registro` | Registrar nuevo usuario | `{ "nombre": "...", "email": "...", "password": "..." }` |
| `GET` | `/closeSection` | Cerrar sesión | N/A |

### 🚨 Emergencias (Botón de Pánico)
| Método | Endpoint | Descripción | Body / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/presion_boton_panico/crear` | Generar nueva alerta | `{ "latitud": "...", "longitud": "...", "tipo": "..." }` |
| `GET` | `/presion_boton_panico/listar` | Ver historial de alertas | N/A |

### 👤 Usuarios y Perfil
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `GET` | `/usuarios/listar` | Obtener lista de usuarios |
| `GET` | `/usuarios/detalle/:id` | Ver detalle de un usuario |
| `PUT` | `/usuarios/actualizar/:id` | Actualizar datos de usuario |

### 📍 Ubicación
| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/ubicaciones_clientes/crear` | Registrar ubicación de cliente |
| `GET` | `/ubicaciones_clientes/listar` | Historial de ubicaciones |

### 📂 Otros Recursos
*   **Contactos**: `/contactos_clientes`, `/contactos_emergencias`
*   **Grupos**: `/grupos`, `/mensajes_grupo`
*   **Dispositivos**: `/dispositivos`
*   **Roles y Permisos**: `/roles`, `/usuarios_roles`

## Version de la app
 2.1.0