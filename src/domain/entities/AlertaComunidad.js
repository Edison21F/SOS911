class AlertaComunidad {
    constructor({
        id,
        idUsuarioSql,
        tipo,
        prioridad,
        estado,
        emitida_offline,
        respuestas,
        location,
        ubicacion,
        detalles,
        contactos_notificados,
        fecha_creacion,
        fecha_cierre,
        historial_estados
    }) {
        this.id = id;
        this.idUsuarioSql = idUsuarioSql;
        this.tipo = tipo;
        this.prioridad = prioridad;
        this.estado = estado;
        this.emitida_offline = emitida_offline;
        this.respuestas = respuestas || [];
        this.location = location; // GeoJSON { type: 'Point', coordinates: [lng, lat] }
        this.ubicacion = ubicacion; // { latitud, longitud, direccion_aproximada }
        this.detalles = detalles;
        this.contactos_notificados = contactos_notificados || [];
        this.fecha_creacion = fecha_creacion;
        this.fecha_cierre = fecha_cierre;
        this.historial_estados = historial_estados || [];
    }
}

module.exports = AlertaComunidad;
