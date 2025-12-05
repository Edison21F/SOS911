# SOS911 Project

Versión actual: 5.4.3

Este proyecto fue creado con [Create React App](https://github.com/facebook/create-react-app) y ha sido expandido con múltiples características y dependencias para crear una aplicación robusta de emergencias.

## Requisitos Previos

- Node.js >=18.0.0
- npm o yarn

## Características Principales

- **Mapas y Geolocalización**: Integración con Google Maps y Leaflet
- **Calendario y Programación**: Sistema completo con FullCalendar
- **Gráficos y Visualización**: ApexCharts y Chart.js
- **UI/UX Avanzado**: 
  - Bootstrap 5.3
  - Íconos (FontAwesome, Bootstrap Icons)
  - Datepickers y Range Pickers
  - Notificaciones
  - Editor Rich Text (React Quill)
  - Tablas de datos
- **Internacionalización**: Soporte para múltiples idiomas con flag-icons

## Scripts Disponibles

En el directorio del proyecto, puedes ejecutar:

### `npm run dev`

Inicia la aplicación en modo desarrollo.\
Abre [http://localhost:3000](http://localhost:3000) para verla en el navegador.

La página se recargará si haces ediciones.\
También verás cualquier error de lint en la consola.

### `npm start`

Ejecuta la aplicación en modo producción usando `serve` en el puerto 8080.\
Este comando debe usarse para despliegue en producción.

### `npm run build`

Construye la aplicación para producción en la carpeta `build`.\
Empaqueta React en modo producción y optimiza la build para el mejor rendimiento.

La build está minificada y los nombres de archivo incluyen los hashes.\
¡Tu aplicación está lista para ser desplegada!

### `npm test`

Lanza el test runner en modo interactivo.\
Consulta la sección sobre [ejecutar tests](https://facebook.github.io/create-react-app/docs/running-tests) para más información.

### `npm run eject`

**Nota: esta es una operación de un solo sentido. Una vez haces `eject`, ¡no puedes volver atrás!**

Si no estás satisfecho con las herramientas de build y las opciones de configuración, puedes hacer `eject` en cualquier momento.


## Dependencias Principales

- **React**: ^18.2.0
- **Mapas**: @react-google-maps/api, react-leaflet
- **Gráficos**: apexcharts, chart.js
- **UI Framework**: bootstrap ^5.3.3
- **Calendario**: @fullcalendar (múltiples módulos)
- **Formularios**: react-select, react-datepicker
- **Utilidades**: axios, typescript

## Configuración del Navegador

El proyecto está configurado para soportar:

```json
"browserslist": {
  "production": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ],
  "development": [
    "last 1 chrome version",
    "last 1 firefox version",
    "last 1 safari version"
  ]
}
```

## Overrides de Dependencias

El proyecto incluye overrides específicos para asegurar la compatibilidad con React 18:

- react-datepicker
- react-notifications-component
- react-tag-autocomplete

## Despliegue

La aplicación está configurada para ser desplegada usando `serve` en producción:

```bash
npm run build  # Construye la aplicación
npm start      # Inicia el servidor en producción en el puerto 8080
```

## Desarrollo

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Inicia el servidor de desarrollo: `npm run dev`
4. Abre [http://localhost:3000](http://localhost:3000)

## Estilo y Linting

El proyecto utiliza la configuración de ESLint extendida de Create React App:

```json
"eslintConfig": {
  "extends": "react-app"
}
```