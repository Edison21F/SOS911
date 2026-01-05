/**
 * Domain Entity representing a Panic Button Press (Alerta/Presion).
 */
class Alerta {
    constructor({
        id,
        clienteId,
        ubicacionesClienteId,
        marca_tiempo,
        estado,
        fecha_creacion,
        fecha_modificacion,
        // Optional expanded info
        cliente_info,
        ubicacion_info
    }) {
        this.id = id;
        this.clienteId = clienteId;
        this.ubicacionesClienteId = ubicacionesClienteId;
        this.marca_tiempo = marca_tiempo;
        this.estado = estado || 'activo';
        this.fecha_creacion = fecha_creacion;
        this.fecha_modificacion = fecha_modificacion;
        this.cliente_info = cliente_info; // Object { nombre, correo }
        this.ubicacion_info = ubicacion_info; // Object { latitud, longitud }
    }
}

module.exports = Alerta;
